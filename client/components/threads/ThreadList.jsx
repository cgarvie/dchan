import React, {Component} from 'react';
import Thread from './Thread.jsx';

class ThreadList extends Component{
  render(){
    console.log("RENDERING THREAD LIST:");
    console.log(this.props.threads);
    if (this.props.threads) {
      var sorted = this.props.threads.sort(function sortbydate(a, b) { // non-anonymous as you ordered...
        console.log(b);
      return b.lastBump < a.lastBump ? -1 // if b should come earlier, push a to end
           : b.lastBump > a.lastBump ? 1 // if b should come later, push a to begin
           : 0;                   // a and b are equal
      });
      return (
        <ul>{
          sorted.map( thread =>{
            return <Thread 
              thread={thread}
              key={thread.id}
              {...this.props}
            />
          })
        }</ul>
      )
    }
    else {
      return (
        <p>There are no threads yet!</p>
        )
    }
  }
}

ThreadList.propTypes = {
  threads: React.PropTypes.array.isRequired,
  setThread: React.PropTypes.func.isRequired,
  activeThread: React.PropTypes.object.isRequired
}

export default ThreadList