import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import GroupModal from '../components/GroupModal';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
      total: 0,
      gid: null,
      groupVisable: false
    }
  }
  rowClickAction(id) {
    this.props.history.push(`/detail-list/${id}`)
  }

  showGroupAction(gid) {
    this.setState({
      gid,
      groupVisable: true
    })
  }

  hideGroupAction() {
    this.setState({
      gid: null,
      groupVisable: false
    })
  }
  groupsAction() {
    $.get('/groups').then(res => {
      if(res.code === 0) {
        const ids = res.data.map(item => item._id);
        $.get('/groups/count', {ids}).then($res => {
          if($res.code === 0) {
            const groups = res.data.map(item => _.assign({}, item, {total: $res.data[item._id] ? $res.data[item._id].success + $res.data[item._id].failed : 0 ,success: $res.data[item._id] && $res.data[item._id].success, failed: $res.data[item._id] && $res.data[item._id].failed}));
            this.setState({
              groups
            })
          }
        })
      }
    });
    $.get('/groups/total').then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  groupOkAction(group) {
    const promise = group._id ? $.put(`/group/${group._id}`, group) : $.post('/group/', group);
    promise.then(res => {
      if(res.code === 0) {
        this.hideGroupAction();
        this.groupsAction();
      }
    })
  }

  componentWillMount() {
    this.groupsAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '种类',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: '总储量',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d.acount
      },
      {
        title: '最新入库价格',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d.acount
      },
      {
        title: '最新出库价格',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d.acount
      },
      {
        title: '更新时间',
        dataIndex: 'created',
        key: 'created',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.showGroupAction(row._id)}} size="small"><Icon type="edit"/></Button>
            <Button style={{marginLeft: 10}} type="danger" size="small"><Icon type="delete"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Button type="primary" onClick={this.showGroupAction.bind(this)}><Icon type="download"/>新增库存</Button>
          <Button type="primary" style={{marginLeft: 10}} disabled><Icon type="download"/>导出报告</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => this.rowClickAction(r._id) }}} columns={columns} dataSource={this.state.groups} size="middle" bordered pagination={false}/>
          {
            this.state.groupVisable ? <GroupModal gid={this.state.gid} visible={this.state.groupVisable} onOk={this.groupOkAction.bind(this)} onCancel={this.hideGroupAction.bind(this)}/> : null
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
