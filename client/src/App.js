import React, { Component } from 'react';
import {
  Button, Checkbox, Form,
  Card, Icon, Image
} from 'semantic-ui-react';
import './App.css';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { withRouter } from "react-router";
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import Profile from './components/profile';
axios.defaults.baseURL = 'http://localhost:5000/';

// axios.defaults.withCredentials = true
// var x = axios.create({ withCredentials: true, })
// axios.defaults.withCredentials = true;
class Home extends Component {
  state = {
    email: '',
    password: ''
  }
  componentDidMount() {

  }
  changeFieldValue = (feild, value) => {
    this.setState({ [feild]: value })
  }
  submit = () => {
    const { email, password } = this.state;
    axios.post('/login', { email, password }).then((data) => {
      // document.cookie = `auth_token=${data.data.auth_token} Domain=http://localhost:500`;
      axios.defaults.headers.common['token'] = data.data.token;
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      this.props.history.push("/dashboard");
    }).catch((err) => {
      console.log(err)
    })

  }

  render() {
    const { email, password } = this.state;
    return (<div style={{ width: '30%', margin: '40px auto' }}><Form onSubmit={this.submit}>
      <Form.Field>
        <label>Email</label>
        <input placeholder='Email' type='email' onChange={(e) => this.changeFieldValue('email', e.target.value)} value={email} />
      </Form.Field>
      <Form.Field>
        <label>Password</label>
        <input placeholder='Password' type='password' onChange={(e) => this.changeFieldValue('password', e.target.value)} email={password} />
      </Form.Field>
      <Button type='submit'>Submit</Button>
    </Form></div>)
  }
}
class Dashboard extends Component {
  state = {
    allPost: [],
    user: {}
  }
  componentDidMount() {
    var token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['token'] = token;
    }
    this.setState({ user: JSON.parse(localStorage.getItem('user')) });
    axios.get('/post'

    ).then((result) => {
      this.setState({ allPost: result.data.posts });
      // this.props.history.push("/dashboard");
    }).catch(() => {
      this.props.history.push("/");
    })
  }
  logout = () => {
    axios.get('/logout').then(() => {
      localStorage.removeItem('token')
      this.props.history.push("/");
    }).catch((err) => {
      console.log(err)
    })
  }
  isUserLiked = post => {
    const userId = JSON.parse(localStorage.getItem('user'))._id;
    return post.likes.find(l => l.user === userId);
  }
  toggleCommentBox = postIndex => {
    const { allPost } = this.state;
    const post = allPost[postIndex];
    if (post.isCommentBoxOpen) {
      post.isCommentBoxOpen = false;
    }
    else {
      post.isCommentBoxOpen = true;
    }
    this.setState({
      allPost: [...allPost]
    })
  }
  canUserDeleteCmnt = (post, comment) => {
    const { user } = this.state;
    return user._id === comment.user || user._id === post.user;
  }
  deleteComment = (post, commentId, postIndex) => {
    axios.delete(`/post/comment/${post._id}/${commentId}`).then(res => {
      const { allPost } = this.state;
      const updatedPost = res.data.post;
      allPost[postIndex] = { ...post, ...updatedPost };
      var newPostList = [...allPost];
      this.setState({
        allPost: newPostList
      })
    })
  }
  getCommentDate = comment => {
    var newDate = new Date(comment.date);
    const fullDate = `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
    return fullDate;
  }
  addCommentChange = (postIndex, newValue) => {
    const { allPost } = this.state;
    allPost[postIndex].addComment = newValue;
    this.setState({
      allPost: [...allPost]
    })
  }
  sendComment = (post, postIndex, comment) => {
    axios.post(`/post/comment/${post._id}`, { text: comment }).then(res => {

      const { allPost } = this.state;
      allPost[postIndex] = { ...post, ...res.data.post };
      allPost[postIndex].addComment = "";
      console.log("before render", allPost)
      this.setState({ allPost: [...allPost] });
    })
  }
  hoverImage = (postIndex) => {
    const { allPost } = this.state
    if (allPost[postIndex].hoverImage) {
      allPost[postIndex].hoverImage = false;
    }
    else {
      allPost[postIndex].hoverImage = true;
    }
    this.setState({
      allPost: [...allPost]
    })
  }
  toggleLikeBox = (postIndex, open = false) => {
    const { allPost } = this.state;

    if (allPost[postIndex].likes.length) {
      allPost[postIndex].likeModelOpen = open;
      this.setState({ allPost: allPost })
    }

  }
  render() {
    const { allPost, user } = this.state;
    console.log("after render", allPost)
    return (<div>
      {allPost.map((p, postIndex) => <div className='post-wrapper'>

        <div className='post-header'>
          <div className="image-container"><img
            src={`http://localhost:5000/profile/profilePic/${p.user}`}
          />
          </div>
          <div> {p.name}</div>
        </div>
        <div className='post-body'>
          {p.text && <h4> {p.text} </h4>}
          {p.avatar && <img
            src={`http://localhost:5000/post/postPic/${p._id}`}
          />}
        </div>
        <div className='post-footer'>
          <div style={{ display: "flex", alignItems: "baseline" }}><span style={{ fontSize: "18px", cursor: p.likes.length ? "pointer" : "initial" }} onClick={this.toggleLikeBox.bind(this, postIndex, true)}>{p.likes.length}</span><Icon disabled name='thumbs up' size='big' link color={this.isUserLiked(p) ? "blue" : "gray"} /></div>
          <div style={{ display: "flex", alignItems: "baseline" }} onClick={this.toggleCommentBox.bind(this, postIndex)} style={{ cursor: "pointer", display: "flex", alignItems: "baseline" }}><span style={{ fontSize: "18px" }}>{p.comments.length}</span><Icon disabled name='comment' size='big' link /></div>
        </div>
        {p.likeModelOpen && <div className="likes-model">
          <div className="inner-content">
            <button onClick={this.toggleLikeBox.bind(this, postIndex, false)}><Icon name="window close" color="red" /></button>
            {p.likes.map(l => <div>
              <img src={`http://localhost:5000/profile/profilePic/${l.user}`} className="profile-pic" />
              <div>{l.name}</div>
            </div>)}
          </div>
        </div>}
        {p.isCommentBoxOpen && <div className="comment-box-container"><div className="add-comment-area">
          <textarea value={p.addComment} onChange={(e) => this.addCommentChange(postIndex, e.target.value)} placeholder="Write a comment..."></textarea>
          <button disabled={!p.addComment} onClick={this.sendComment.bind(this, p, postIndex, p.addComment)}>Add</button>
        </div>

          {p.comments.map((c, cmtIndex) => <div className="comment-box">
            <div className="comment-header-wrapper">
              <div className="comment-header">
                <div>
                  <img src={`http://localhost:5000/profile/profilePic/${c.user}`} />
                </div>
                <div>{c.name}</div>
              </div>
              <div style={{ color: "#aba4a4", fontStyle: "italic" }}>{this.getCommentDate(c)}</div>
            </div>
            <div className="comment-text">

              {c.text}</div>
            {this.canUserDeleteCmnt(p, c) && <div><button className="delete-btn" onClick={this.deleteComment.bind(this, p, c._id, postIndex)}>Delete</button></div>}
          </div>)}</div>}
      </div>)}
    </div>)
  }
}
class App extends Component {
  render() {
    return (<Router>
      <div>
        <Route path="/" component={withRouter(Home)} exact />
        <Route path="/dashboard" component={withRouter(Dashboard)} />
        <Route path="/myProfile" component={withRouter(Profile)} />
      </div>
    </Router>)
  }
}

export default App;
