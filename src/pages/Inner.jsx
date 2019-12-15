import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Button, Icon, Upload } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';

export default class Inner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
      total: 0,
    }
  }

  componentWillMount() {
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
        title: '数量',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d.acount
      },
      {
        title: '入库价格',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d.acount
      },
      {
        title: '人员',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d.acount
      },
      {
        title: '供应商',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d.acount
      },
      {
        title: '入库时间',
        dataIndex: 'created',
        key: 'created',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '付款情况',
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
          <Button type="primary" onClick={() => {}}><Icon type="download"/>入库</Button>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.groups} size="middle" bordered pagination={false}/>
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
