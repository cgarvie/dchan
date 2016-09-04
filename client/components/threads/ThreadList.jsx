import React, {Component} from 'react'
import Thread from './Thread.jsx'
import Masonry from 'react-masonry-component'

var masonryOptions = {
    transitionDuration: 100
};


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
            <Masonry
                className={'my-gallery-class'} // default ''
                elementType={'ul'} // default 'div'
                options={masonryOptions} // default {}
                disableImagesLoaded={false} // default false
                updateOnEachImageLoad={false} // default false and works only if disableImagesLoaded is false
            >
            {
              sorted.map( thread =>{
                return <Thread 
                  thread={thread}
                  key={thread.id}
                  {...this.props}
                />
              })
            }
            </Masonry>
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