import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Select, Progress, Button, Icon, Upload, Form } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import BackModal from '../components/models/BackModal';
import ListModal from '../components/models/ListModal';

export default class Back extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      back: {
        list: [],
        id: null
      },
      visible: {
        back: false,
        list: false,
      },
      conditions: {
        date: [],
        type: 0
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

  openModelAction(modelName, id = null) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = true;
    this.setState({
      visible,
      id
    })
  }

  okBackModalAction() {
    this.cancelModelAction('back');
    this.listAction();
  }

  listAction() {
    $.get('/orders', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          orders: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/orders/total', this.state.conditions).then(res => {
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

  checkBacksAction(id) {
    $.get('/order/backs', {order: id}).then(res => {
      if(res.code === 0) {
        this.setState({
          back: Object.assign({}, this.state.back, {list: res.data})
        }, () => {
          this.openModelAction('list')
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
        title: '订单号',
        dataIndex: '_id',
        render: d => <a href="javascript:void(0)" type="link" onClick={this.checkBacksAction.bind(this, d)}>{d}</a>
      },
      {
        title: '类型',
        dataIndex: 'type',
        render: d => {
          let s = '';
          switch(d) {
            case 1:
            s = <Tag color="red">入库</Tag>;
            break;
            case 2 :
            s = <Tag color="green">出库</Tag>;
            break;
          }
          return s;
        }
      },
      {
        title: '种类',
        dataIndex: 'fruit.title'
      },
      // {
      //   title: '总储量',
      //   dataIndex: 'fruit.total',
      // },
      {
        title: '总重量',
        dataIndex: 'count',
        key: 'count',
        render: d => `${d} 斤`
      },
      {
        title: '数量',
        dataIndex: 'packCount'
      },
      {
        title: '规格',
        render: d => {
          if(!d.unit) return '无';
          return `${d.unitCount} 斤/${d.unit.title}`;
        }
      },
      {
        title: '价格(元)',
        dataIndex: 'price',
        key: 'price'
      },
      {
        title: '操作人',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d && d.acount
      },
      {
        title: '商家',
        render: d => {
          let s = '';
          switch(d.type) {
            case 1:
            s = d.puller && d.puller.title;
            break;
            case 2:
            s = d.pusher && d.pusher.title;
            break;
          }
          return s;
        }
      },
      {
        title: '时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '付款情况',
        dataIndex: 'payStatu',
        key: 'payStatu',
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
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('back',row._id)}} size="small"><Icon type="rollback"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item label="时间">
              <DatePicker.RangePicker format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item label="类型">
              <Select style={{width: 100}} value={this.state.conditions.type} onChange={e => this.conditionsChangeAction(e, 'type')}>
                <Select.Option value={0}>全部</Select.Option>
                <Select.Option value={1}>入库</Select.Option>
                <Select.Option value={2}>出库</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table scroll={{x: true}} rowKey="_id" onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.orders} size="middle" bordered pagination={false}/>
          {
            this.state.visible.back && <BackModal id={this.state.id} visible={this.state.visible.back} onOk={this.okBackModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'back')}/>
          }
          {
            this.state.visible.list && <ListModal id={this.state.back.id} width={'70%'} columns={backColumns} dataSource={this.state.back.list} visible={this.state.visible.list} onCancel={this.cancelModelAction.bind(this, 'list')}/>
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
const backColumns = [
  {
    title: '序号',
    render: (t, d, index) => index + 1
  },
  {
    title: '退货单号',
    dataIndex: '_id'
  },
  {
    title: '订单号',
    dataIndex: 'order',
    render: d => d._id
  },
  {
    title: '退货方',
    dataIndex: 'order',
    key: 'back',
    render: d => d.type === 1 ? d.puller.title : d.pusher.title
  },
  {
    title: '退货数量',
    dataIndex: 'count',
    render: d => `${d}斤`
  },
  {
    title: '时间',
    dataIndex: 'createdAt',
    render: d => m(d).format('YYYY-MM-DD')
  }
]
