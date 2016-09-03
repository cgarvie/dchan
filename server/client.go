package main

import (
	//"fmt"
	r "github.com/dancannon/gorethink"
	"github.com/gorilla/websocket"
	"log"
)

type FindHandler func(string) (Handler, bool)

type Client struct {
	send         chan Message
	socket       *websocket.Conn
	findHandler  FindHandler
	session      *r.Session
	stopChannels map[int]chan bool
	//id           string
	// ^ We are no longer using this.
	// We are using this.user.Id instead.
	//userName     string
	//
	//userId         string
	//userSessionKey string
	//userIsAuthenticated bool
	//userSession         UserSession
	//
	user                User // me.user is the browser's session.
	userIsAuthenticated bool
	userAccount         UserAccount // me.userAccount is the registered user account
	userSession         UserSession // me.userSession is the registered user account's session
	// but they can leave the website and stay logged in ...
	// .. you don't really know they are there unless you "bump"/poll

	ipHash string

	// A new user comes to the website.
	// They appear as online.
	// They make post A.
	// They register an account and log in
	// They make post B.
	// Both posts show USER=ONLINE
	// They close the browser window.
	// Both posts show USER=OFFLINE
	// They open the browser again and go back to the website. Due to cookies, they are still logged in.
	// Post A shows USER=OFFLINE.
	// Post B shows USER=ONLINE.
}

func (c *Client) getUserAlias() string {
	if c.userIsAuthenticated {
		if c.userAccount.CurrentAlias != "" {
			return c.userAccount.CurrentAlias
		} else {
			return c.userAccount.UserName
		}
	} else {
		return c.user.Name
	}
}

func (c *Client) NewStopChannel(stopKey int) chan bool {
	c.StopForKey(stopKey)
	stop := make(chan bool)
	c.stopChannels[stopKey] = stop
	return stop
}

func (c *Client) StopForKey(key int) {
	if ch, found := c.stopChannels[key]; found {
		ch <- true
		delete(c.stopChannels, key)
	}
}

func (client *Client) Read() {
	var message Message
	for {
		if err := client.socket.ReadJSON(&message); err != nil {
			break
		}
		if handler, found := client.findHandler(message.Name); found {
			handler(client, message.Data)
		}
	}
	client.socket.Close()
}

func (client *Client) Write() {
	for msg := range client.send {
		if err := client.socket.WriteJSON(msg); err != nil {
			break
		}
	}
	client.socket.Close()
}

func (c *Client) Close() {
	for _, ch := range c.stopChannels {
		ch <- true
	}

	close(c.send)
	// delete user, end activeSession, and delete IP hash session
	r.Table("activeSession").Filter(r.Row.Field("sess").Eq(c.user.Id)).Limit(1).Delete().Exec(c.session)
	r.Table("activeSession").Filter(r.Row.Field("sess").Eq(c.ipHash)).Limit(1).Delete().Exec(c.session)
	r.Table("activeSession").Filter(r.Row.Field("sess").Eq(c.userAccount.Id)).Limit(1).Delete().Exec(c.session)
	r.Table("user").Get(c.user.Id).Delete().Exec(c.session)
	//r.Table("activeSession").Filter(r.Row.Field("sess").Eq(c.userSession.Id)).Limit(1).Delete().Exec(c.session) // needed?

	// When I have multiple windows open, closing a single window will delete my iphash from active session,
	// but i still have other windows open and are thus still active...

	// time to stop and think hard and actually plan this.

	// what about logged in users?
	// ^ THIS IS NOT WORKING IN PRACTICE
	// BECAUSE THE GO APP IS STILL SO UNSTABLE THAT WEBSOCKETS DIE AND IT CRASHES
	// IN THE CONSOLE.
}

func NewClient(socket *websocket.Conn, findHandler FindHandler,
	session *r.Session) *Client {

	u := User{Name: "anonymous"}
	res, err := r.Table("user").Insert(u).RunWrite(session)
	if err != nil {
		log.Println(err.Error())
	}
	if len(res.GeneratedKeys) > 0 {
		u.Id = res.GeneratedKeys[0] // ! EXTREMELY IMPORTANT
	}
	return &Client{
		send:         make(chan Message),
		socket:       socket,
		findHandler:  findHandler,
		session:      session, // This is the rethink database session
		stopChannels: make(map[int]chan bool),
		//id:           id,
		//userName:     user.Name,
		//userId:         "",
		//userSession: "",
		user:                u,
		userIsAuthenticated: false,
		userAccount:         UserAccount{},
		userSession:         UserSession{},
	}
}
