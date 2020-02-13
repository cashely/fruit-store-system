import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Popconfirm, message, Input, Progress, Select, Button, Icon, Upload, Form } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import {userInfoAction, plus, multipliedBy, minus, dividedBy} from '../functions/index';
import OuterModal from '../components/models/OuterGroupModal';
import PayModal from '../components/models/PayModal';

export default class Outer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outers: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        outer: false,
        pay: false
      },
      conditions: {
        date: [],
        id: '',
        fruit: '',
        pusher: '',
      },
      fruits: [],
      pushers: [],
      selected: [],
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

  okOuterModalAction() {
    this.cancelModelAction('outer');
    this.listAction();
  }

  listAction() {
    $.get('/outers', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          outers: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/outers/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  deleteAction(id) {
    $.delete(`/outer/${id}`).then(res => {
      if(res.code === 0) {
        this.listAction();
        message.success('操作成功')
      } else {
        message.error('操作失败');
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

  pullersListAction() {
    $.get('/pushers', {limit: 1000}).then(res => {
      if(res.code === 0) {
        this.setState({
          pushers: res.data
        })
      }
    })
  }

  fruitsListAction() {
    $.get('/fruits', {limit: 1000}).then(res => {
      if(res.code === 0) {
        this.setState({
          fruits: res.data
        })
      }
    })
  }

  tableSelectChangeAction(selected) {
    this.setState({
      selected
    })
  }

  printAction() {
    window.open(`/#/print/outer?ids=${this.state.selected}`)
  }

  componentWillMount() {
    this.listAction();
    userInfoAction.call(this);
    this.pullersListAction();
    this.fruitsListAction();
  }
  render() {
    const {Option} = Select;
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '序号',
        key: 'i',
        render: (t, d, index) => index + 1
      },
      {
        title: '订单号',
        dataIndex: '_id'
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
        render: d => `${d.toFixed(2)} 斤`
      },
      {
        title: '数量',
        key: 'packCount',
        render: d => (d.unit && d.unit.title) ? `${d.packCount} ${d.unit.title}` : d.packCount
      },
      {
        title: '规格',
        key: 'b',
        render: d => {
          if(!d.unit) return '无';
          return `${d.unitCount} 斤/${d.unit.title}`;
        }
      },
      {
        title: '出库价格(元)',
        key: 'price',
        render: d => (d.unit && d.unit.title) ? `${d.price} 元/${d.unit.title}` : d.price
      },
      {
        title: '入库价',
        dataIndex: 'order',
        render: d => d && d.price ? `${d.price} 元/斤`
      },
      {
        title: '下单数量',
        dataIndex: 'reserve'
      },
      {
        title: '金额',
        dataIndex: 'payTotal',
        render: d => d.toFixed(2)
      },
      {
        title: '利润',
        key: 'r',
        render:(d) => {
          return d.order ? multipliedBy(minus(dividedBy(d.price, d.unitCount), d.order.price), d.count) : '无'
        }
      },
      {
        title: '出库人员',
        dataIndex: 'creater',
        render: d => d && d.acount
      },
      {
        title: '送货方',
        dataIndex: 'pusher',
        render: d => d && d.title
      },
      {
        title: '出库时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '总金额',
        dataIndex: 'payTotal',
        render: d => `${d.toFixed(2)}元`
      },
      {
        title: '已付金额',
        dataIndex: 'payNumber',
        render: d => `${d.toFixed(2)}元`
      },
      {
        title: '付款情况',
        key: 'payStatu',
        render: d => {
          let s = '';
          switch(d.payStatu) {
            case 1:
            s = <Tag color="red" onClick={this.openModelAction.bind(this, 'pay',d._id)}>未付款</Tag>;
            break;
            case 2 :
            s = <Tag color="green">已付款</Tag>;
            break;
          }
          return s;
        }
      },
      {
        title: '入库单',
        dataIndex: 'order',
        render: d => d && d._id
      },
      {
        title: '操作',
        align: 'center',
        render: row => (
          <React.Fragment>
            {
              //<Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('outer',row._id)}} size="small"><Icon type="edit"/></Button>
            }
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
              <Button type="primary" onClick={this.openModelAction.bind(this, 'outer', null)}><Icon type="download"/>出库</Button>
            </Form.Item>
            <Form.Item label="时间">
              <DatePicker.RangePicker style={{width: 220}} format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item label="订单号">
              <Input style={{width: 240}} value={this.state.conditions.id} onChange={e => this.conditionsChangeAction(e, 'id', 'input')} />
            </Form.Item>
            <Form.Item label="出货商">
              <Select style={{width: 110}} allowClear dropdownMatchSelectWidth={false} placeholder="全部" value={this.state.conditions.pusher} showSearch filterOption={(v,s) => s.props.children.includes(v)}  onChange={e => this.conditionsChangeAction(e, 'pusher')}>
                {
                  this.state.pushers.map(pusher => <Option value={pusher._id} key={pusher._id} >{pusher.title}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item label="种类">
              <Select style={{width: 100}} allowClear dropdownMatchSelectWidth={false} placeholder="全部" value={this.state.conditions.fruit} showSearch filterOption={(v,s) => s.props.children.includes(v)}  onChange={e => this.conditionsChangeAction(e, 'fruit')}>
                {
                  this.state.fruits.map(fruit => <Option value={fruit._id} key={fruit._id} >{fruit.title}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.searchAction.bind(this)}>搜索</Button>
            </Form.Item>
          </Form>
          <Form layout="inline">
            <Form.Item>
              <Button disabled={this.state.selected.length === 0} type="primary" onClick={this.printAction.bind(this)}>批量打印</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table
            rowSelection={
              {
                fixed: true,
                onChange: this.tableSelectChangeAction.bind(this)
              }
            }
            footer={
              (data) => {
                return (
                  <React.Fragment>
                    <b>统计:</b>
                    <span style={{marginLeft: 10}}>{`总重量:${data.reduce((a, b) => plus(a, b.count), 0) }斤; 总金额:${data.reduce((a, b) => plus(a, b.payTotal), 0)}元`}</span>
                  </React.Fragment>
                )
              }
            }
            rowKey="_id" scroll={{x: true}} onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.outers} size="middle" bordered pagination={false}/>
          {
            this.state.visible.outer && <OuterModal id={this.state.id} visible={this.state.visible.outer} onOk={this.okOuterModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'outer')}/>
          }
          {
            this.state.visible.pay && <PayModal id={this.state.id} visible={this.state.visible.pay} onOk={this.listAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'pay')}/>
          }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} showSizeChanger pageSizeOptions={['20', '40', '100', '200']} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)} onShowSizeChange={this.pageChangeAction.bind(this)}/>
        </Footer>
      </Layout>
    )
  }
}
