import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Table, Tag, Input, Progress, Select, Button, Icon, Upload, Form } from 'antd';
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
      page: 1,
      limit: 20,
      id: null,
      visible: {
        outer: false
      },
      conditions: {
        date: [],
        id: '',
        fruit: '',
        pusher: '',
      },
      fruits: [],
      pushers: [],
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

  componentWillMount() {
    this.listAction();
    this.pullersListAction();
    this.fruitsListAction();
  }
  render() {
    const {Option} = Select;
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
        title: '出库价格(元)',
        dataIndex: 'price'
      },
      {
        title: '成本均价',
        dataIndex: 'avgPrice'
      },
      {
        title: '下单数量',
        dataIndex: 'reserve'
      },
      {
        title: '金额',
        dataIndex: 'payTotal',
      },
      {
        title: '利润',
        render:(d) => {
          return (d.price - d.avgPrice) * d.count
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
        </Header>
        <Content style={{overflow: 'auto'}}>
          <Table rowKey="_id" scroll={{x: true}} onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.outers} size="middle" bordered pagination={false}/>
          {
            this.state.visible.outer && <OuterModal id={this.state.id} visible={this.state.visible.outer} onOk={this.okOuterModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'outer')}/>
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
