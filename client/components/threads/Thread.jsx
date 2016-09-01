import React, {Component} from 'react';

class Thread extends Component{
  onClick(e){
    console.log("THREAD WAS CLICKED ON.");
    e.preventDefault();
    const {setThread, thread} = this.props;
    setThread(thread);
  }
  render(){
    console.log("RENDERING ME . I AM A THREAD");
    //let {thread} = this.props;
    const {thread, activeThread} = this.props;
    const active = Thread === activeThread ? 'active' : '';
    console.log("This one is active or not?:", active);
    console.log("This thread,s name is:", thread.name);
    return (
      <li>
        <a onClick={this.onClick.bind(this)}>
          {thread.name}
        </a>
      </li>
    )
  }
}

Thread.propTypes = {
  thread: React.PropTypes.object.isRequired,
  setThread: React.PropTypes.func.isRequired,
  activeThread: React.PropTypes.object.isRequired
}

export default Thread