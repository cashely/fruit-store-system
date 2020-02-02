import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Form, Input, Table, Tag, Progress, Button, Icon, Upload, Popconfirm, message } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import FruitModel from '../components/models/FruitModel';

export default class Outer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fruits: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        fruit: false
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

  okFruitModelAction() {
    this.cancelModelAction('fruit');
    this.listAction();
  }

  listAction() {
    $.get('/fruits', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          fruits: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/fruits/total', this.state.conditions).then(res => {
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

  searchAction() {
    this.setState({
      page: 1
    }, this.listAction);
  }

  deleteAction(id) {
    $.delete(`/fruit/${id}`).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        this.listAction();
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
        title: '名称',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: '状态',
        dataIndex: 'statu',
        render: d => d === 1 ? <Tag color="green">正常</Tag> : <Tag color="red">停售</Tag>
      },
      {
        title: '当前库存',
        render: d => d.total >= d.min ? <Tag color="green">{d.total}</Tag> : <Tag color="red">{d.total}</Tag>
      },
      {
        title: '入库价格',
        dataIndex: 'innerPrice'
      },
      {
        title: '出库价格',
        dataIndex: 'outerPrice'
      },
      {
        title: '均价',
        dataIndex: 'avgPrice'
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('fruit', row._id)}} size="small"><Icon type="edit"/></Button>
              <Popconfirm
                title="您确定要删除?"
                onConfirm={this.deleteAction.bind(this, row._id)}
                okText="是"
                cancelText="否"
              >
                <Button style={{marginLeft: 10}} type="danger" size="small"><Icon type="delete"/></Button>
              </Popconfirm>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item>
                <Button type="primary" onClick={this.openModelAction.bind(this, 'fruit', null)}><Icon type="plus"/>新增</Button>
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
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.fruits} size="middle" bordered pagination={false}/>
          {
            this.state.visible.fruit && <FruitModel id={this.state.id} visible={this.state.visible.fruit} onOk={this.okFruitModelAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'fruit')}/>
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
