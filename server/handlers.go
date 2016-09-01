package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	r "github.com/dancannon/gorethink"
	//"golang.org/x/net/context"
	"github.com/mitchellh/mapstructure"
	//"html"
	"io"
	//"io/ioutil"
	//"log"
	"math/rand"
	"net/http"
	//"net/textproto"
	"github.com/aws/aws-sdk-go/aws"
	//"github.com/aws/aws-sdk-go/aws/awserr"
	"errors"
	"github.com/aws/aws-sdk-go/aws/awsutil"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"os"
	"time"
)

const (
	ChannelStop = iota
	UserStop
	ThreadStop
	MessageStop
)

/*
SOME CONSTANT VARIABLES.
MOVE THESE WHEN WE LEARN HOW TO HANDLE THEM BETTER...
*/

//S3_PATH_PREFIX = "//s3-us-west-2.amazonaws.com/deechan/"

/* end CONSTANTS */

type Message struct {
	Name string      `json:"name"`
	Data interface{} `json:"data"`
}

type Channel struct {
	Id   string `json:"id" gorethink:"id,omitempty"`
	Name string `json:"name" gorethink:"name"`
}

type Thread struct {
	Id        string    `json:"id" gorethink:"id,omitempty"`
	Name      string    `json:"name" gorethink:"name"`
	LastBump  time.Time `gorethink:"lastBump"`
	ChannelId string    `gorethink:"channelId"`
}

type User struct {
	Id   string `gorethink:"id,omitempty"`
	Name string `gorethink:"name"`
}

type UserAccount struct {
	Id           string    `gorethink:"id,omitempty"`
	UserName     string    `gorethink:"userName"`
	PasswordHash string    `gorethink:"passwordHash"`
	CreatedTime  time.Time `gorethink:"createdTime"`
}

type UserSession struct {
	Id         string    `gorethink:"id,omitempty"`
	SessionKey string    `gorethink:"sessionKey"`
	UserId     string    `gorethink:"userId"` //primaryKey ?
	LoginTime  time.Time `gorethink:"loginTime"`
}

type ThreadMessage struct {
	Id         string    `gorethink:"id,omitempty"`
	ThreadId   string    `gorethink:"threadId"`
	Body       string    `gorethink:"body"`
	Attachment string    `gorethink:"attachment"`
	Author     string    `gorethink:"author"`
	CreatedAt  time.Time `gorethink:"createdAt"`
}

/*
func (threadMessage *ThreadMessage) Decode(data, &threadMessage) error {
	mapstructure.Decode(data, &threadMessage)
	threadMessage.Attachment = S3_PATH_PREFIX + threadMessage.Attachment
}
*/

func registerUser(client *Client, data interface{}) {
	var a UserAccount
	fmt.Println("Starting...")
	err := mapstructure.Decode(data, &a)
	if err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}

	// check if username is taken
	res, _ := r.Table("account").Filter(r.Row.Field("userName").Eq(a.UserName)).Run(client.session)
	//if err != nil {
	//	client.send <- Message{"warning", "This username has already been taken."}
	//	client.send <- Message{"error", err.Error()}
	//	return
	//	// error
	//}
	row := UserAccount{}
	err = res.One(&row)
	if err == r.ErrEmptyResult {
		// username is available
	} else {
		client.send <- Message{"warning", "Username has been taken."}
		// ^ THERE IS NO ERROR (err , err.Error()) BECAUSE WE WERE LOOKING FOR A ROW! There would be an error above, with r.EmptyResultSet
		return
	}

	a.CreatedTime = time.Now()
	fmt.Println("adding user to db")
	_, err = r.Table("account").
		Insert(a).
		RunWrite(client.session)
	if err != nil {
		client.send <- Message{"error", err.Error()}
	}

}

func printObj(v interface{}) {
	vBytes, _ := json.Marshal(v)
	fmt.Println(string(vBytes))
}

func randomString(l int) string {
	bytes := make([]byte, l)
	for i := 0; i < l; i++ {
		bytes[i] = byte(randInt(65, 90))
	}
	return string(bytes)
}

func randInt(min int, max int) int {
	return min + rand.Intn(max-min)
}

func upImg(filepath string, filename string) (string, error) {

	// DO NOT PUT credentials in code for production usage!
	// instead do...

	//creds := credentials.NewStaticCredentials(aws_access_key_id, aws_secret_access_key, token)
	creds := credentials.NewSharedCredentials("config/aws.conf", "default")

	_, err := creds.Get()
	if err != nil {
		fmt.Printf("bad credentials: %s", err)
	}

	cfg := aws.NewConfig().WithRegion("us-west-2").WithCredentials(creds)
	svc := s3.New(session.New(), cfg)

	file, err := os.Open(filepath)
	if err != nil {
		fmt.Printf("err opening file: %s", err)
	}

	defer file.Close()

	fileInfo, _ := file.Stat()
	var size int64 = fileInfo.Size()

	buffer := make([]byte, size)

	// read file content to buffer
	_, err = file.Read(buffer)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	fileBytes := bytes.NewReader(buffer)

	fileType := http.DetectContentType(buffer)

	switch fileType {
	case "image/jpeg",
		"image/jpg",
		"image/gif",
		"image/png",
		"audio/webm",
		"video/webm": // pretty sure "image/jpg" does not actually exist as a MIME-type
		fmt.Sprintln("Uploaded filetype", fileType, "is acceptable.")

		//"application/pdf":       // not image, but application !
		// etc

	default:
		fmt.Sprintln("Uploaded filetype", fileType, "is NOT acceptable.")
		return "", errors.New("ERROR UPLOADING FILE. BAD FILETYPE")
	}

	fname_prefix := randomString(20)
	path := "/ugc/" + fname_prefix + "_" + filename
	params := &s3.PutObjectInput{
		Bucket:        aws.String("deechan"),
		Key:           aws.String(path),
		Body:          fileBytes,
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(fileType),
	}
	resp, err := svc.PutObject(params)
	if err != nil {
		fmt.Printf("bad response: %s", err)
	}
	fmt.Printf("response %s", awsutil.StringValue(resp))

	return path, nil

}

func UploadFile(w http.ResponseWriter, r *http.Request) {

	/****
	TODO:
	IN THE FUTURE, YOU SHOULD PROBABLY JUST TRANSFER
	THE BINARY FILES OVER THE EXISTING WEBSOCKET CONNECTION.
	THEN U CAN SEND ERROR MESSAGES BACK EASIER, ETC
	*/

	//fmt.Printf("Hello, %q", html.EscapeString(r.URL.Path))
	w.Header().Set("Access-Control-Allow-Origin", "*")
	r.ParseMultipartForm(32 << 20) // max memory limit etc
	file, handler, err := r.FormFile("uploadfile")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()
	//fmt.Fprintf(w, "%v", handler.Header)
	var fname = "./tmp/" + handler.Filename
	f, err := os.OpenFile(fname, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer f.Close()
	// defer os.Remove(fname)

	io.Copy(f, file)
	newFileName, errr := upImg(fname, handler.Filename)
	if errr != nil {
		fmt.Fprintf(w, "ERROR: Unallowed filetype or bad file.")
	}
	//client.send <- Message{"upload good", newFileName}
	fmt.Println("We are now returning http request with content:", newFileName)
	fmt.Fprintf(w, newFileName)

	//for _, c := range readCookies(r.Header, name) {

	fmt.Println("NOW LETs READ SOME COOKIES FOR FUN")
	c, err := r.Cookie("userSessionKey")
	if err != nil {
		fmt.Println("userSessionKey Cookie Not Found!")
	} else {
		fmt.Printf("n: %v , v: %v", c.Name, c.Value)
	}

	for _, c := range r.Cookies() {
		//c.Name
		//c.Value
		fmt.Printf("Name: %v , Value: %v", c.Name, c.Value)
	}
	fmt.Println("DONE READING COOKIES")

}

func loginUser(client *Client, data interface{}) {
	var a UserAccount
	fmt.Println("the data we got:")
	//fmt.Printf(data)
	fmt.Println(".")
	err := mapstructure.Decode(data, &a)
	if err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	//fmt.Println("we are looking for user", a.UserName)
	//fmt.Println("we are looking for user w password", a.PasswordHash)

	//fmt.Printf("looking for a user w name %v and pass %v", a.UserName, a.PasswordHash)
	res, err := r.Table("account").Filter(r.Row.Field("userName").Eq(a.UserName)).Filter(r.Row.Field("passwordHash").Eq(a.PasswordHash)).Run(client.session)
	if err != nil {
		client.send <- Message{"warning", "Bad username or password."}
		client.send <- Message{"error", err.Error()}
		return
		// error
	}
	row := UserAccount{}
	err = res.One(&row)
	if err == r.ErrEmptyResult {
		client.send <- Message{"warning", "Bad username or password."}
		client.send <- Message{"error", err.Error()}
		return
		// row not found
	}
	if err != nil {
		client.send <- Message{"warning", "Bad username or password."}
		client.send <- Message{"error", err.Error()}
		return
		// error
	}
	uid := row.Id
	//usn := row.UserName
	fmt.Printf("logging in as user: %v", uid)

	rand.Seed(time.Now().UTC().UnixNano())
	sessKey := randomString(10)
	sess := UserSession{SessionKey: sessKey,
		UserId:    uid,
		LoginTime: time.Now()}
	printObj(sess)
	_, err = r.Table("session").
		//Get(sid).
		Insert(sess). //, r.InsertOpts{Conflict: "update"}).
		RunWrite(client.session)
	if err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	// log in client object
	client.userIsAuthenticated = true
	client.userAccount = row
	client.userSession = sess
	//
	client.send <- Message{"auth-good", sess}

}

func logoutUser(client *Client, data interface{}) {
	client.userIsAuthenticated = false
	client.userAccount = UserAccount{}
	client.userSession = UserSession{}
}

func editUser(client *Client, data interface{}) {
	var user User
	err := mapstructure.Decode(data, &user)
	if err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	client.userName = user.Name
	go func() {
		_, err := r.Table("user").
			Get(client.id).
			Update(user).
			RunWrite(client.session)
		if err != nil {
			client.send <- Message{"error", err.Error()}
		}
	}()
}

func subscribeUser(client *Client, data interface{}) {
	go func() {
		stop := client.NewStopChannel(UserStop)
		cursor, err := r.Table("user").
			Changes(r.ChangesOpts{IncludeInitial: true}).
			Run(client.session)

		if err != nil {
			client.send <- Message{"error", err.Error()}
			return
		}
		changeFeedHelper(cursor, "user", client.send, stop)
	}()
}

func unsubscribeUser(client *Client, data interface{}) {
	client.StopForKey(UserStop)
}

func addThreadMessage(client *Client, data interface{}) {
	var threadMessage ThreadMessage
	err := mapstructure.Decode(data, &threadMessage)
	if err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	if threadMessage.ThreadId == "" {
		fmt.Println("CANT ADD MESSAGE. NO THREAD SPECIFIED.")
		client.send <- Message{"error", "can't add msg. no thread specified."}
		return
	}
	if threadMessage.Body == "" {
		fmt.Println("CANT ADD MESSAGE. NO BODY INCLUDED.")
		client.send <- Message{"error", "can't add msg. no body included."}
		return
	}
	go func() {
		threadMessage.CreatedAt = time.Now()
		if client.userIsAuthenticated {
			fmt.Println("NEW COMMENT. by user who is LOGGED IN")
			threadMessage.Author = client.userAccount.UserName
		} else {
			fmt.Println("NEW COMMENT. by user who is ANON")
			threadMessage.Author = "anon-" + client.userName
		}
		err := r.Table("message").
			Insert(threadMessage).
			Exec(client.session)
		if err != nil {
			client.send <- Message{"error", err.Error()}
		}
		go func() {
			//fmt.Printf("you are user %v", client.id)
			//fmt.Printf("time is %v", time.Now())
			//fmt.Println("Bumping channel:" + threadMessage.ThreadId)
			_, err := r.Table("thread").
				Get(threadMessage.ThreadId).
				Update(map[string]interface{}{
					"lastBump": time.Now(),
				}).
				RunWrite(client.session)
			//fmt.Printf("%#v", resp)
			if err != nil {
				fmt.Println("ERR", err)
				client.send <- Message{"error", err.Error()}
			}
		}()
	}()
}

func subscribeThreadMessage(client *Client, data interface{}) {
	go func() {
		eventData := data.(map[string]interface{})
		val, ok := eventData["threadId"]
		if !ok {
			return
		}
		threadId, ok := val.(string)
		if !ok {
			return
		}
		stop := client.NewStopChannel(MessageStop)
		cursor, err := r.Table("message").
			OrderBy(r.OrderByOpts{Index: r.Desc("createdAt")}).
			Filter(r.Row.Field("threadId").Eq(threadId)).
			Changes(r.ChangesOpts{IncludeInitial: true}).
			Run(client.session)

		if err != nil {
			client.send <- Message{"error", err.Error()}
			return
		}
		changeFeedHelper(cursor, "message", client.send, stop)
	}()
}

func unsubscribeThreadMessage(client *Client, data interface{}) {
	client.StopForKey(MessageStop)
}

func addChannel(client *Client, data interface{}) {
	var channel Channel
	err := mapstructure.Decode(data, &channel)
	if err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	go func() {
		err = r.Table("channel").
			Insert(channel).
			Exec(client.session)
		if err != nil {
			client.send <- Message{"error", err.Error()}
		}
	}()
}

func addThread(client *Client, data interface{}) {
	fmt.Println("adding thread 1")
	var thread Thread
	err := mapstructure.Decode(data, &thread)
	fmt.Println("adding thread 2")
	if err != nil {
		client.send <- Message{"error", err.Error()}
		return
	}
	thread.LastBump = time.Now()
	go func() {
		err = r.Table("thread").
			Insert(thread).
			Exec(client.session)
		fmt.Println("adding thread 3")
		if err != nil {
			client.send <- Message{"error", err.Error()}
		}
	}()
}

func subscribeThread(client *Client, data interface{}) {
	go func() {
		fmt.Printf("%v , %T", data, data)
		if data == nil {
			fmt.Println("IT IS NULL")
			return
		}
		eventData := data.(map[string]interface{})
		val, ok := eventData["channelId"]
		if !ok {
			return
		}
		channelId, ok := val.(string)
		if !ok {
			return
		}
		stop := client.NewStopChannel(ThreadStop)
		cursor, err := r.Table("thread").
			OrderBy(r.OrderByOpts{Index: r.Desc("lastBump")}).
			Filter(r.Row.Field("channelId").Eq(channelId)).
			Changes(r.ChangesOpts{IncludeInitial: true}).
			Run(client.session)

		if err != nil {
			client.send <- Message{"error", err.Error()}
			return
		}
		changeFeedHelper(cursor, "thread", client.send, stop)
	}()
}

func unsubscribeThread(client *Client, data interface{}) {
	client.StopForKey(ThreadStop)
}

func subscribeChannel(client *Client, data interface{}) {
	go func() {
		stop := client.NewStopChannel(ChannelStop)
		cursor, err := r.Table("channel").
			Changes(r.ChangesOpts{IncludeInitial: true}).
			Run(client.session)
		if err != nil {
			client.send <- Message{"error", err.Error()}
			return
		}
		changeFeedHelper(cursor, "channel", client.send, stop)
	}()
}

func unsubscribeChannel(client *Client, data interface{}) {
	client.StopForKey(ChannelStop)
}

func changeFeedHelper(cursor *r.Cursor, changeEventName string,
	send chan<- Message, stop <-chan bool) {
	change := make(chan r.ChangeResponse)
	cursor.Listen(change)
	for {
		eventName := ""
		var data interface{}
		select {
		case <-stop:
			cursor.Close()
			return
		case val := <-change:
			if val.NewValue != nil && val.OldValue == nil {
				eventName = changeEventName + " add"
				data = val.NewValue
			} else if val.NewValue == nil && val.OldValue != nil {
				eventName = changeEventName + " remove"
				data = val.OldValue
			} else if val.NewValue != nil && val.OldValue != nil {
				eventName = changeEventName + " edit"
				data = val.NewValue
			}
			send <- Message{eventName, data}
		}
	}
}
