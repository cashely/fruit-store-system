import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Popconfirm, Table, Tag, Form, Input, Progress, Button, Icon, Upload } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import {userInfoAction, deleteAction} from '../functions/index';
import PullerModal from '../components/models/PullerModal';

export default class Outer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pullers: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        puller: false
      },
      conditions: {
        title: ''
      }
    }
  }

  conditionsChangeAction(e, field, type) {
    let value;
    switch(type) {
      case 'input' : value = e.currentTarget.value; break;
      default: value = e;
    }
    this.setState({
      conditions: Object.assign({}, this.state.conditions, {[field]: value})
    });
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

  okPullerModalAction() {
    this.cancelModelAction('puller');
    this.listAction();
  }

  searchAction() {
    this.setState({
      page: 1
    }, this.listAction);
  }

  listAction() {
    $.get('/pullers', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          pullers: res.data
        })
      }
    })
  }

  deleteAction(id) {
    deleteAction.call(this, {
      success: this.listAction.bind(this),
      url: `/puller/${id}`
    })
  }

  countListAction() {
    $.get('/pullers/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  pageChangeAction(page, pageSize) {
    this.setState({
      page
    }, this.listAction);
  }

  componentWillMount() {
    this.listAction();
    userInfoAction.call(this);
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '供应商名称',
        dataIndex: 'title',
      },
      {
        title: '联系人',
        dataIndex: 'contact',
      },
      {
        title: '联系地址',
        dataIndex: 'address',
      },
      {
        title: '联系方式',
        dataIndex: 'tel',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('puller', row._id)}} size="small"><Icon type="edit"/></Button>
            {
              this.state.user && this.state.user.role === 3  && <Popconfirm
                title="您确认要删除这条数据吗?"
                onConfirm={this.deleteAction.bind(this, row._id)}
              >
                <Button type="danger" style={{marginLeft: 10}} size="small"><Icon type="delete"/></Button>
              </Popconfirm>
            }
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item>
                <Button type="primary" onClick={this.openModelAction.bind(this, 'puller', null)}><Icon type="plus"/>新增供应商</Button>
            </Form.Item>
            <Form.Item>
              <Input value={this.state.conditions.title} onChange={e => this.conditionsChangeAction(e, 'title', 'input')} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.pullers} size="middle" bordered pagination={false}/>
            {
              this.state.visible.puller && <PullerModal id={this.state.id} visible={this.state.visible.puller} onOk={this.okPullerModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'puller')}/>
            }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)}/>
        </Footer>
      </Layout>
    )
  }
}

let dataSources = []

for(var a = 0; a < 20; a++) {
  dataSources.push({
    id: a,
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
