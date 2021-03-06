import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import OuterModal from '../components/models/OuterModal';

export default class Outer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outers: [],
      total: 0,
      id: null,
      visible: {
        outer: false
      }
    }
  }
  cancelModelAction(modelName) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = false;
    this.setState({
      visible,
      id: null
    })
  }

  openModelAction(modelName, id = null) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = true;
    this.setState({
      visible,
      id
    })
  }

  okOuterModalAction() {
    this.cancelModelAction('outer');
    this.listAction();
  }

  listAction() {
    $.get('/outers').then(res => {
      if(res.code === 0) {
        this.setState({
          outers: res.data
        })
      }
    })
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '序号',
        render: (t, d, index) => index + 1
      },
      {
        title: '种类',
        dataIndex: 'fruit.title'
      },
      {
        title: '总储量',
        dataIndex: 'fruit.total',
      },
      {
        title: '数量',
        dataIndex: 'count',
        render: d => `${d} 斤`
      },
      {
        title: '出库价格(元)',
        dataIndex: 'price'
      },
      {
        title: '出库人员',
        dataIndex: 'creater',
        render: d => d && d.acount
      },
      {
        title: '送货方',
        dataIndex: 'puller',
        render: d => d && d.title
      },
      {
        title: '出库时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '付款情况',
        dataIndex: 'payStatu',
        render: d => {
          let s = '';
          switch(d) {
            case 1:
            s = <Tag color="red">未付款</Tag>;
            break;
            case 2 :
            s = <Tag color="green">已付款</Tag>;
            break;
          }
          return s;
        }
      },
      {
        title: '操作',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('outer',row._id)}} size="small"><Icon type="edit"/></Button>
            <Button style={{marginLeft: 10}} type="danger" size="small"><Icon type="delete"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Button type="primary" onClick={this.openModelAction.bind(this, 'outer', null)}><Icon type="download"/>出库</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.outers} size="middle" bordered pagination={false}/>
          {
            this.state.visible.outer && <OuterModal id={this.state.id} visible={this.state.visible.outer} onOk={this.okOuterModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'outer')}/>
          }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total}/>
        </Footer>
      </Layout>
    )
  }
}

let dataSources = []

for(var a = 0; a < 20; a++) {
  dataSources.push({
    _id: a,
    title: `测试用例${a+1}`,
    total: 50,
    successed: 20,
    failed: 20,
    undo: 10,
    creater: '张三',
    runtime: '2013-01-01',
    created: '2013-01-02'
  })
}
