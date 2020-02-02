import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Form, Input, Table, Tag, Progress, Button, Icon, Upload, Popconfirm, message } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import UnitModal from '../components/models/UnitModal';

export default class Unit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      units: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        unit: false
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

  okUnitModelAction() {
    this.cancelModelAction('unit');
    this.listAction();
  }

  listAction() {
    $.get('/units', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          units: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/units/total', this.state.conditions).then(res => {
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
    $.delete(`/unit/${id}`).then(res => {
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
        title: '规格名称',
        dataIndex: 'title',
        render: d => `斤/${d}`
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
                <Button type="primary" onClick={this.openModelAction.bind(this, 'unit', null)}><Icon type="plus"/>新增</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.units} size="middle" bordered pagination={false}/>
          {
            this.state.visible.unit && <UnitModal id={this.state.id} visible={this.state.visible.unit} onOk={this.okUnitModelAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'unit')}/>
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
