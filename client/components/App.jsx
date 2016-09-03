import React, {Component} from 'react';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';



import ThreadSection from './threads/ThreadSection.jsx';
import UserSection from './users/UserSection.jsx';
import MessageSection from './messages/MessageSection.jsx';
import NavSection from './navbar/NavSection.jsx';
import AlertBar from './snackbar/Alert.jsx';

import AuthModal from './modals/AuthModal.jsx';
import AliasModal from './modals/AliasModal.jsx';


import Socket from '../socket.js';
import cookie from 'react-cookie';

function isEmpty( obj ) { 
  for ( var prop in obj ) { 
    return false; 
  } 
  return true; 
}

//

class App extends Component{


  constructor(props){
    super(props);

    
    this.state = {
      channels: [],
      users: [],
      activeSessions: [], // both BrowserSessions and UserAccountSessions
      /*
      threads: [{channelId: "fsdfdsf",
                id: "fdsfdsf",
                lastBump: "",
                name: "sample thread"}],
      */
      threads: [],
      messages: [],

      aliases: [],
      activeAlias: "",

      activeChannel: {},
      activeThread: {},
      connected: false,
      connectionHasEverDropped: false,
      warningAlert: "", // should refactor this so it's specific to the onAlert function

      userId: cookie.load('userId'),
      userSessionKey: cookie.load('userSessionKey')
    };


  }

/*
  getChildContext() { 
    return {
      muiTheme: getMuiTheme({
        palette: {
          accent1Color: deepOrange500,
        }
      })
    }
  }
*/

  OpenAuthModal() {
    this.refs.authModal.triggerDialog();
  }
  OpenAliasModal() {
    this.refs.aliasModal.triggerDialog();
  }
  LoginUser(username, password){
    this.socket.emit('user login', {UserName: username, 
                                    PasswordHash: password});
  }
  RestoreUserSession(userId, sessionKey) {
    console.log("trying to restore session...")
    this.socket.emit('session restore', {UserId: userId, 
                                    SessionKey: sessionKey});
  }
  RegisterUser(username, password){
    this.socket.emit('user register', {UserName: username, 
                                      PasswordHash: password});
  }

  AddUserAlias(alias){
    this.socket.emit('alias add', {Alias: alias});
  }

  onAlert(msg, duration=2000) {
    let {warningAlert} = this.state;
    console.log("JUST GOT THE FOLLOWING ERROR");
    console.log(msg)
    console.log("^^^")
    this.setState({ warningAlert: msg })
    console.log("in App, warningAlert =", this.state.warningAlert)
    this.refs.snackbar.openAlert(duration)
  }
  
  onLogin(sess) {
    let {userId, userSessionKey} = this.state;
    console.log("successfully logged in!");
    console.log(sess)
    console.log("^^^")
    cookie.save('userId', sess.UserId, { path: '/' });
    cookie.save('userSessionKey', sess.SessionKey, { path: '/' });
    this.setState({ userId: sess.UserId, 
                    userSessionKey: sess.SessionKey });
  }

  LogoutUser() {
    let {userId, userSessionKey} = this.state;
    console.log("logging out via clearing cookies.");
    cookie.save('userId', '', { path: '/' });
    cookie.save('userSessionKey', '', { path: '/' });
    this.setState({ userId: '', 
                    userSessionKey: '' });
    //
    this.socket.emit('user logout', {}); // is this second argument optional?
  }
  /*
  onLogout() {
    cookie.remove('userId', { path: '/' });
    cookie.remove('userSessionKey', { path: '/' });
    //Object.keys(cookie.select().forEach(name => cookie.remove(name, { path: '/' }))
  }
  */

  componentWillMount(){
   
  }

  componentDidMount(){
    let ws = new WebSocket('ws://localhost:4000')
    let socket = this.socket = new Socket(ws); 

    socket.on('connect', this.onConnect.bind(this));
    socket.on('disconnect', this.onDisconnect.bind(this));
    socket.on('channel add', this.onAddChannel.bind(this));
    socket.on('channel edit', this.onEditChannel.bind(this));
    socket.on('thread add', this.onAddThread.bind(this));
    socket.on('thread edit', this.onEditThread.bind(this));

    socket.on('user add', this.onAddUser.bind(this));
    socket.on('user edit', this.onEditUser.bind(this));
    socket.on('user remove', this.onRemoveUser.bind(this));

    socket.on('activeSession add', this.onAddActiveSession.bind(this));
    socket.on('activeSession remove', this.onRemoveActiveSession.bind(this));

    socket.on('alias-add', this.onAliasAdd.bind(this));
    socket.on('alias-delete', this.onAliasDelete.bind(this));

    socket.on('user-info', this.onGetUserInfo.bind(this));

    socket.on('message add', this.onMessageAdd.bind(this));
    socket.on('auth-good', this.onLogin.bind(this));
    //socket.on('auth-bad', this.LogoutUser.bind(this)); // questionable decision.
    socket.on('warning', this.onAlert.bind(this));
  }
  componentDidUpdate() {
    // THIS SHIT ISFUCKEDI NEEDA DEEPER UNDERSTANDING OF REACT.
    //console.log("THE CHANENLS I NQUESIONT ARE ", this.state.channels)
    //let {activeChannel, channels} = this.state;
    //this.setState({activeChannel: channels[0]});
    //this.setChannel(channels[0].id)
    //console.log("current channel is,", this.state.activeChannel)
  }
  onMessageAdd(message){
    let {messages} = this.state;
    messages.push(message);
    this.setState({messages});
    this.onAlert("new post just now. scroll down.", 1000)
  }

  onGetUserInfo(userInfo){
  //console.log("WE GOT INFO")
  //console.log(userInfo)
  this.setState({activeAlias: userInfo.CurrentAlias})

  }

  onAliasAdd(a){
    let {aliases} = this.state;
    aliases.push(a);
    this.setState({aliases});
  }
  onAliasDelete(a){
    let {aliases} = this.state;
    aliases = aliases.filter(alias => {
      return alias !== a;
    });
    this.setState({aliases});
  }


  onAddActiveSession(as){
    let {activeSessions} = this.state;
    activeSessions.push(as.sess);
    this.setState({activeSessions});
    console.log("ThiS IS WHAT WE ARE DEALING IWITH:", activeSessions)
  }
  onRemoveActiveSession(acSess){
    let {activeSessions} = this.state;
    /* 
    // THIS DOES NOT WORK BECAUSE IT DELETES ALL, NOT JUST LIMITED TO 1
    activeSessions = activeSessions.filter(activeSess => {
      return activeSess !== acSess.sess;
    });
    */
    // on the other hand, this will delete just the first occurance.
    var index = activeSessions.indexOf(acSess.sess)
    if (index > -1) {
        activeSessions.splice(index, 1)
    }
    this.setState({activeSessions});
  }
  /*
  updateActiveSessions(){
    let {users, activeSessions} = this.state;
    activeSessions = []
    users.forEach(function (user) {
      if (user.id !== '') { activeSessions.push(user.id) }
      if (user.accountId !== '') { activeSessions.push(user.accountId) }
    });
    this.setState({activeSessions});
  }
  */
  onRemoveUser(removeUser){
    let {users} = this.state;
    users = users.filter(user => {
      return user.id !== removeUser.id;
    });
    this.setState({users});
    //this.updateActiveSessions();
  }
  onAddUser(user){
    let {users} = this.state;
    users.push(user);
    this.setState({users});
    //this.updateActiveSessions();
  }
  onEditUser(editUser){
    let {users} = this.state;
    users = users.map(user => {
      if(editUser.id === user.id){
        return editUser;
      }
      return user;
    });
    this.setState({users});
    //this.updateActiveSessions();
  }
  onConnect(){
    this.setState({connected: true});
    this.socket.emit('channel subscribe');
    this.socket.emit('user subscribe');
    this.socket.emit('activeSession subscribe');

    let {connectionHasEverDropped} = this.state
    if (connectionHasEverDropped == true) {
      this.onAlert("... and we're back!", 3000)
    } else {

      // do stuff for the first and only time
      this.RestoreUserSession(this.state.userId, this.state.userSessionKey)

    }
  }
  onDisconnect(){
    let {connected} = this.state
    if (connected == false) {
      this.onAlert("We were unable to connect to the server.", 99999)
    } else {
      this.onAlert("Your internet connection has dropped.", 99999)
    }
    this.setState({connected: false, connectionHasEverDropped: true});
  }
  onAddChannel(channel){
    let {channels, activeChannel} = this.state;
    channels.push(channel);
    
    if (Object.keys(activeChannel).length === 0) {
      if (channel.name == 'misc') {
        activeChannel = channel;
        console.log("WE SET TO MISC")
        //alert("ADDING MISC == ");
      }
   }
   this.setState({channels, activeChannel});
  }
  addChannel(name){
    this.socket.emit('channel add', {name});
  }
  onEditChannel(editChannel){
    let {channels} = this.state;
    channels = channels.map(channel => {
      if(editChannel.id === channel.id){
        return editChannel;
      }
      return channel;
    });
    this.setState({channels});
  }
  
  setChannel(activeChannel){
    this.setState({activeChannel});
    this.setState({activeThread: {}})
    this.setState({messages: []})
    this.socket.emit('thread unsubscribe');
    this.setState({threads: []});
    this.socket.emit('thread subscribe',
      {channelId: activeChannel.id});
  }

  onAddThread(thread){
    let {threads} = this.state;
    console.log("adding thread", thread);
    threads.push(thread);
    this.setState({threads});
  }
  addThread(name){
    let {activeChannel} = this.state;
    console.log("we r gonna send:");
    console.log(JSON.stringify({name, channelId: activeChannel.id}));
    this.socket.emit('thread add', {name, channelId: activeChannel.id});
  }
  onEditThread(editThread){
    // TODO: 
    // if activeThread is nil, or is not in {threads} , 
    // then display:none the messages div
    console.log("threads have been edited!");
    let {threads} = this.state;
    threads = threads.map(thread => {
      if(editThread.id === thread.id){
        return editThread;
      }
      return thread;
    });
    this.setState({threads});
  }
  setThread(activeThread){
    this.setState({activeThread});
    this.forceUpdate()
    this.socket.emit('message unsubscribe');
    this.setState({messages: []});
    this.socket.emit('message subscribe',
      {threadId: activeThread.id});
  }
  setActiveAlias(alias){
    //this.forceUpdate()
    this.socket.emit('alias select', {alias});
    // really we should wait for a reply here.
    // the request could be denied.
    // also, if we do it that way, we can auto-set alias when they make a new one.
    this.setState({activeAlias: alias});
  }
  setUserName(name){
    this.socket.emit('user edit', {name});
  }
  addMessage(body, attachment){
    let {activeThread} = this.state;
    console.log("we are submitting", attachment);
    this.socket.emit('message add',
      {threadId: activeThread.id, Body: body, Attachment: attachment});
  }
  render(){
    var msg_panel, thread_panel;
    var right_side_container_class_name = "";
    let {activeThread} = this.state;
    if (!isEmpty(activeThread)){
      right_side_container_class_name = "rght"
      msg_panel = <MessageSection 
            {...this.state} 
            addMessage={this.addMessage.bind(this)} 
            setChannel={this.setChannel.bind(this)} 
            onAlert={this.onAlert.bind(this)}
            />
    }
    else {
      right_side_container_class_name = "rght-nomsgs";
      thread_panel = <ThreadSection
            {...this.state}
            addThread={this.addThread.bind(this)}
            setThread={this.setThread.bind(this)}
          />
    }
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div className='app'>
        <div className='toolbar'>
          <NavSection
                {...this.state}
                OpenAuthModal={this.OpenAuthModal.bind(this)}
                OpenAliasModal={this.OpenAliasModal.bind(this)}
                setChannel={this.setChannel.bind(this)}
                LogoutUser={this.LogoutUser.bind(this)}
                setActiveAlias={this.setActiveAlias.bind(this)}
              />
        </div>
        <div className='cont'>
            <div className='nav'>
              <UserSection
                {...this.state}
                setUserName={this.setUserName.bind(this)}
              />
            </div>
            <div className={right_side_container_class_name}>
              {thread_panel}
              {msg_panel}
            </div>
        </div>
        <AlertBar
          ref="snackbar"
          {...this.state}
          />
          <div>
            <AuthModal 
              ref="authModal"
              {...this.state}
              LoginUser={this.LoginUser.bind(this)}
              RegisterUser={this.RegisterUser.bind(this)}
            />
            <AliasModal 
              ref="aliasModal"
              {...this.state}
              AddUserAlias={this.AddUserAlias.bind(this)}
            />
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App

/* 

<div className='nav'>
  <UserSection
    {...this.state}
    setUserName={this.setUserName.bind(this)}
  />
</div>

*/
