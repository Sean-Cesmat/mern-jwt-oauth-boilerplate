import React, { Component } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import { UserProfile } from './UserProfile';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super()
    this.state = {
      token: '',
      user: null,
      googleUser: null
    }
    this.liftTokenToState = this.liftTokenToState.bind(this)
    this.logout = this.logout.bind(this)
    this.checkForLocalToken = this.checkForLocalToken.bind(this)
    this.checkForGoogleUser = this.checkForGoogleUser.bind(this)
  }

  liftTokenToState(data) {
    this.setState({
      token: data.token,
      user: data.user
    })
  }

  logout() {
    console.log('Logging Out')
    localStorage.removeItem('mernToken')
    this.setState({token: '', user: null, googleUser: null })
    axios.get('/auth/logout', result => console.log(result));
  }

  checkForLocalToken() {
    var token = localStorage.getItem('mernToken')
    if (token === 'undefined' || token === null || token === '' || token === undefined) {
      localStorage.removeItem('mernToken')
      this.setState({
        token: '',
        user: null,
        googleUser: null,
      })
    } else {
      axios.post('/auth/me/from/token', {
        token,
      }).then( result => {
        localStorage.setItem('mernToken', result.data.token)
        this.setState({
          token: result.data.token,
          user: result.data.user,
        })
      }).catch( err => console.log(err))
    }
  }

  checkForGoogleUser() {
    axios.get('/auth/user').then(response => {
      if (response.data.user) {
        // We found a google user in the SESSION
        let googleUser = {
          googleId: response.data.user.googleId,
          displayName: response.data.user.displayName
        }
        this.setState({
          googleUser
        })
      } else {
        // We did not find a google user
        this.setState({
          googleUser: null
        })
      }
    })
  }

  componentDidMount() {
    this.checkForGoogleUser()
    this.checkForLocalToken()
  }

  render() {
    let theUser = this.state.user || this.state.googleUser
    if (theUser) {
      return (
        <div className="App">
          <UserProfile user={theUser} logout={this.logout} />
        </div>
      );
    } else {
      return (
        <div className="App">
          <Signup liftToken={this.liftTokenToState} />
          <Login liftToken={this.liftTokenToState} />
        </div>
      );
    }
  }
}

export default App;
