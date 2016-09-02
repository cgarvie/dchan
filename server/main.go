/*

TODO: there are new msgs in this thread, jump to them? < [snackbar]

*/

package main

import (
	//"bytes"
	//"fmt"
	r "github.com/dancannon/gorethink"
	//"golang.org/x/net/context"
	//"html"
	//"io"
	//"io/ioutil"
	"log"
	"net/http"
	"net/textproto"
	//"os"
)

type FileHeader struct {
	Filename string
	Header   textproto.MIMEHeader
	// contains filtered or unexported fields
}

func main() {
	session, err := r.Connect(r.ConnectOpts{
		Address:  "localhost:28015",
		Database: "dchan",
	})

	if err != nil {
		log.Panic(err.Error())
	}

	router := NewRouter(session)

	router.Handle("channel add", addChannel)
	router.Handle("channel subscribe", subscribeChannel)
	router.Handle("channel unsubscribe", unsubscribeChannel)

	router.Handle("thread add", addThread)
	router.Handle("thread subscribe", subscribeThread)
	router.Handle("thread unsubscribe", unsubscribeThread)

	router.Handle("alias add", addUserAccountAlias)

	router.Handle("user edit", editUser)
	router.Handle("user register", registerUser)
	router.Handle("user login", loginUser)
	router.Handle("user logout", logoutUser)
	router.Handle("user subscribe", subscribeUser)
	router.Handle("user unsubscribe", unsubscribeUser)

	router.Handle("message add", addThreadMessage)
	router.Handle("message subscribe", subscribeThreadMessage)
	router.Handle("message unsubscribe", unsubscribeThreadMessage)

	http.Handle("/", router)
	http.HandleFunc("/upload", UploadFile)

	fs := http.FileServer(http.Dir("tmp"))
	http.Handle("/tmp/", http.StripPrefix("/tmp/", fs))

	http.ListenAndServe(":4000", nil)
}
