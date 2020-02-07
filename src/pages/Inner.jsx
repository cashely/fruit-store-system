import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Progress, Select, Button, Icon, Upload, Form, Input } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import InnerModal from '../components/models/InnerGroupModal';
import PayModal from '../components/models/PayModal';
import LostModal from '../components/models/LostModal';

export default class Inner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inners: [],
      total: 0,
      page: 1,
      limit: 20,
      id: null,
      visible: {
        inner: false,
        pay: false,
        lost: false
      },
      conditions: {
        date: [],
        id:'',
        puller: '',
        fruit: '',
        filterStore: 1
      },
      pullers:[],
      fruits: [],
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
    console.log(e, field)
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

  okInnerModalAction() {
    this.cancelModelAction('inner');
    this.listAction();
  }

  listAction() {
    $.get('/inners', {page: this.state.page, limit: this.state.limit, ...this.state.conditions}).then(res => {
      if(res.code === 0) {
        this.countListAction();
        this.setState({
          inners: res.data
        })
      }
    })
  }

  countListAction() {
    $.get('/inners/total', this.state.conditions).then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  pageChangeAction(page, limit) {
    this.setState({
      page,
      limit
    }, this.listAction);
  }

  searchAction() {
    this.setState({
      page: 1
    }, this.listAction);
  }

  pullersListAction() {
    $.get('/pullers', {limit: 1000}).then(res => {
      if(res.code === 0) {
        this.setState({
          pullers: res.data
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
    window.open(`/#/print/inner?ids=${this.state.selected}`)
  }

  componentWillMount() {
    this.listAction();
    this.pullersListAction();
    this.fruitsListAction();
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
        dataIndex: '_id'
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
        title: '总重量',
        dataIndex: 'count',
        key: 'count',
        render: d => `${d} 斤`
      },
      {
        title: '损耗',
        dataIndex: 'lost'
      },
      {
        title: '余量',
        dataIndex: 'store',
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
        title: '入库价格(元)',
        dataIndex: 'price',
        key: 'price'
      },
      {
        title: '入库人员',
        dataIndex: 'creater',
        key: 'creater',
        render: d => d && d.acount
      },
      {
        title: '供应商',
        dataIndex: 'puller',
        key: 'puller',
        render: d => d && d.title
      },
      {
        title: '入库时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '总金额',
        dataIndex: 'payTotal',
        render: d => `${d}元`
      },
      {
        title: '已付金额',
        dataIndex: 'payNumber',
        render: d => `${d}元`
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
        title: '操作',
        key: 'id',
        align: 'center',
        render: row => (
          <React.Fragment>
            {
              // <Button type="primary" onClick={(e) => {e.stopPropagation(); this.openModelAction('inner',row._id)}} size="small"><Icon type="edit"/></Button>
            }
            {
              <Button type="primary" size="small" onClick={(e) => {e.stopPropagation(); this.openModelAction('lost',row._id)}}><Icon type="bg-colors"/></Button>
            }
          </React.Fragment>
        )
      }
    ];
    const { Option } = Select;
    return (
      <Layout style={{height: '100%', backgroundColor: '#fff', display: 'flex'}}>
        <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
          <Form layout="inline">
            <Form.Item>
                <Button type="primary" onClick={this.openModelAction.bind(this, 'inner', null)}><Icon type="download"/>入库</Button>
            </Form.Item>
            <Form.Item label="时间">
              <DatePicker.RangePicker style={{width: 220}} format="YYYY-MM-DD" value={this.state.conditions.date} onChange={e => this.conditionsChangeAction(e, 'date', 'DATE')} />
            </Form.Item>
            <Form.Item label="订单号">
              <Input style={{width: 240}} value={this.state.conditions.id} onChange={e => this.conditionsChangeAction(e, 'id', 'input')} />
            </Form.Item>
            <Form.Item label="供应商">
              <Select style={{width: 110}} dropdownMatchSelectWidth={false} allowClear placeholder="全部" value={this.state.conditions.puller} showSearch filterOption={(v,s) => s.props.children.includes(v)}  onChange={e => this.conditionsChangeAction(e, 'puller')}>
                {
                  this.state.pullers.map(puller => <Option value={puller._id} key={puller._id} >{puller.title}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item label="种类">
              <Select style={{width: 100}} dropdownMatchSelectWidth={false} allowClear placeholder="全部" value={this.state.conditions.fruit} showSearch filterOption={(v,s) => s.props.children.includes(v)}  onChange={e => this.conditionsChangeAction(e, 'fruit')}>
                {
                  this.state.fruits.map(fruit => <Option value={fruit._id} key={fruit._id} >{fruit.title}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item label="过滤零库存">
              <Select style={{width: 60}} dropdownMatchSelectWidth={false} allowClear placeholder="全部" value={this.state.conditions.filterStore} onChange={e => this.conditionsChangeAction(e, 'filterStore')}>
                <Option value={0}>否</Option>
                <Option value={1}>是</Option>
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
                    <span style={{marginLeft: 10}}>{`总重量:${data.reduce((a, b) => a + b.count, 0) }斤; 总金额:${data.reduce((a, b) => a + b.payTotal, 0)}元`}</span>
                  </React.Fragment>
                )
              }
            }
            rowKey="_id" scroll={{x: true}} onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.inners} size="middle" bordered pagination={false}/>
          {
            this.state.visible.inner && <InnerModal id={this.state.id} visible={this.state.visible.inner} onOk={this.okInnerModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'inner')}/>
          }
          {
            this.state.visible.pay && <PayModal id={this.state.id} visible={this.state.visible.pay} onOk={this.listAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'pay')}/>
          }
          {
            this.state.visible.lost && <LostModal id={this.state.id} visible={this.state.visible.lost} onOk={this.listAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'lost')}/>
          }
        </Content>
        <Footer style={{padding: 5, backgroundColor: '#fff'}}>
          <Pagination defaultCurrent={1} total={this.state.total} showSizeChanger pageSizeOptions={['20', '40', '100', '200']} pageSize={this.state.limit} current={this.state.page} onChange={this.pageChangeAction.bind(this)} onShowSizeChange={this.pageChangeAction.bind(this)}/>
        </Footer>
      </Layout>
    )
  }
}
