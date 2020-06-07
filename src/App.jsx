import React from 'react';
import Video from './components/video';
import { Layout } from 'antd';

import './App.less';

const { Header, Content } = Layout;

function App() {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header>
        <img className="App-logo" src={require('./logo.svg')} alt="logo"/>
        <h1 className="App-title">Online Video</h1>
      </Header>
      <Content>
        <Video />
      </Content>
    </Layout>
  );
}

export default App;
