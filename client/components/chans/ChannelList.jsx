import React, {Component} from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';



class ChannelList extends Component{
  constructor(props) {
    super(props);
    const {channel, activeChannel} = this.props;
    this.state = {
      value: activeChannel,
      //value: '784b3c2e-367c-4dac-affe-432275a25dd0',
      //value: 1
    };
  }

  handleChange(event, index, value) {
    this.setState({value});
    const {setChannel} = this.props;
    setChannel(value);
  }

  render(){
    let {activeChannel} = this.props;
    var sorted = this.props.channels.sort(function sortbydate(a, b) { // non-anonymous as you ordered...
    return b.lastBump < a.lastBump ? -1 // if b should come earlier, push a to end
         : b.lastBump > a.lastBump ? 1 // if b should come later, push a to begin
         : 0;                   // a and b are equal
    });
    //console.log("WE ARE RE-RENDERING THE CHANNEL LIST.")
    //console.log(this.state.value)
    return (
      <div>
        <DropDownMenu value={activeChannel} onChange={this.handleChange.bind(this)}>
          {sorted.map( chan =>{
            /*
            return <Channel 
              channel={chan}
              key={chan.id}
              //value={chan.id}
              //primaryText={chan.name}
              //onClick={this.handleChange}
              {...this.props}
            />
            */
            //if (chan.name != 'misc') {}
            return <MenuItem 
                    key={chan.id}
                    value={chan}
                    primaryText={'/'+chan.name+'/'}
                    secondaryText={chan.description}
                     />
          })}
        </DropDownMenu>
      </div>
    )
  }
}

ChannelList.propTypes = {
  channels: React.PropTypes.array.isRequired,
  setChannel: React.PropTypes.func.isRequired,
  activeChannel: React.PropTypes.object.isRequired,
}

/*

      <DropDownMenu value='{activeChannel.id}' onChange={this.handleChange.bind(this)}>



        
        */

export default ChannelList