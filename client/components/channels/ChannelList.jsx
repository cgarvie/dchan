import React, {Component} from 'react';
import Channel from './Channel.jsx';

class ChannelList extends Component{
  render(){
    var sorted = this.props.channels.sort(function sortbydate(a, b) { // non-anonymous as you ordered...
    return b.lastBump < a.lastBump ? -1 // if b should come earlier, push a to end
         : b.lastBump > a.lastBump ? 1 // if b should come later, push a to begin
         : 0;                   // a and b are equal
    });
    return (
      <ul>{
        sorted.map( chan =>{
          return <Channel 
            channel={chan}
            key={chan.id}
            {...this.props}
          />
        })
      }</ul>
    )
  }
}

ChannelList.propTypes = {
  channels: React.PropTypes.array.isRequired,
  setChannel: React.PropTypes.func.isRequired,
  activeChannel: React.PropTypes.object.isRequired
}

export default ChannelList