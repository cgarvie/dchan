package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	r "github.com/dancannon/gorethink"
	"github.com/gorilla/websocket"
	"net"
	"net/http"
)

type Handler func(*Client, interface{})

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Router struct {
	rules   map[string]Handler
	session *r.Session
}

func NewRouter(session *r.Session) *Router {
	return &Router{
		rules:   make(map[string]Handler),
		session: session,
	}
}

func (r *Router) Handle(msgName string, handler Handler) {
	r.rules[msgName] = handler
}

func (r *Router) FindHandler(msgName string) (Handler, bool) {
	handler, found := r.rules[msgName]
	return handler, found
}

func GetIP(r *http.Request) string {
	if ipProxy := r.Header.Get("X-FORWARDED-FOR"); len(ipProxy) > 0 {
		return ipProxy
	}
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	return ip
}

func GetMD5Hash(text string) string {
	hasher := md5.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}

func (e *Router) ServeHTTP(w http.ResponseWriter, request *http.Request) {
	socket, err := upgrader.Upgrade(w, request, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, err.Error())
		return
	}
	client := NewClient(socket, e.FindHandler, e.session)
	ip := GetIP(request)
	client.ipHash = GetMD5Hash(ip)
	editUser(client, map[string]interface{}{
		"Name": "anon-" + client.ipHash[:8],
	})

	_, err = r.Table("activeSession").Insert(map[string]interface{}{"id": client.ipHash}).RunWrite(client.session)
	if err != nil {
		fmt.Println(err.Error())
	}

	//addActiveSession(client.ipHash)
	fmt.Println("NEW CLIENT CONNECTED. IP is", ip, ", known as:", client.getUserAlias())
	defer client.Close()
	go client.Write()
	client.Read()

}
