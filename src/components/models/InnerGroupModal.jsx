import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, Table, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class InnerGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      units: [],
      pullers: [],
      fruits: [],
      payStatus: [{
        id: 1,
        title: '未付款'
      }, {
        id: 2,
        title: '已付款'
      }],
      dataSource: []
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    }, () => {

    })
  }
  okAction() {
      const faileds = [];
      const promises = this.state.fields.map((field, index) => {
        return $.post(`/inner`, field).then(res => {
          if(res.code !== 0) {
            faileds.push(index)
          }
        })
      })
      Promise.all(promises).then(results => {
        if(faileds.length === 0) {
          message.success('操作成功');
          this.props.onOk();
        }else {
          message.error('部分操作失败，请仔细检查');
          this.setState({
            fields: this.state.fields.filter((v, index) => !faileds.includes(index))
          });
        }
      })
  }
  detailAction() {
    $.get(`/inner/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }

  pullersListAction() {
    $.get('/pullers').then(res => {
      if(res.code === 0) {
        this.setState({
          pullers: res.data
        })
      }
    })
  }

  fruitsListAction() {
    $.get('/fruits').then(res => {
      if(res.code === 0) {
        this.setState({
          fruits: res.data
        })
      }
    })
  }

  unitsListAction() {
    $.get('/units').then(res => {
      if(res.code === 0) {
        this.setState({
          units: res.data
        })
      }
    })
  }

  addRowAction() {
    const fields = _.cloneDeep(this.state.fields);
    fields.push(_.assign(_.cloneDeep(dataTemplate), {key: this.state.fields.length}));
    console.log(fields)
    this.setState({
      fields
    })
  }

  delRowAction(index) {
    let fields = _.cloneDeep(this.state.fields);
    fields = fields.slice(0, index).concat(fields.slice(index + 1))
    this.setState({
      fields
    })
  }

  editRowFieldAction(index, fieldname, e) {
    const fields = _.cloneDeep(this.state.fields);

    fields[index][fieldname] = typeof(e) === 'object' ? e.currentTarget.value : e;
    if(fieldname === 'fruit') {
      const fruit = _.find(this.state.fruits, {_id: typeof(e) === 'object' ? e.currentTarget.value : e});
      fields[index].avgPrice = fruit.avgPrice
    }


    console.log(fields)
    this.setState({
      fields
    }, () => {
      if(fieldname === 'unit' || fieldname === 'packCount' || fieldname === 'unitCount') {

        if(this.state.fields[index].unit && this.state.fields[index].packCount && this.state.fields[index].unitCount) {
          const fields = _.cloneDeep(this.state.fields);
          fields[index].count = this.state.fields[index].packCount * this.state.fields[index].unitCount
          this.setState({
            fields
          })
        }
      }
    })
  }

  componentWillMount() {
    this.pullersListAction();
    this.fruitsListAction();
    this.unitsListAction();
    this.addRowAction();
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;

    const columns = [
      {
        title: '',
        render: (d, r, index) => (
          <React.Fragment>
            {
              this.state.fields.length > 1 && <Button type="danger" size="small" onClick={this.delRowAction.bind(this, index)}><Icon type="delete"/></Button>
            }
            {
              index === this.state.fields.length - 1 && <Button style={{marginLeft: 10}} type="primary" size="small" onClick={this.addRowAction.bind(this)}><Icon type="plus"/></Button>
            }
          </React.Fragment>
        )
      },
      {
        title: '种类',
        render: (d, r, index) => (
          <Select dropdownMatchSelectWidth={false} style={{width: 100}} value={this.state.fields[index].fruit} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.editRowFieldAction(index, 'fruit', e)}>
            {
              this.state.fruits.map(fruit => <Option value={fruit._id} key={fruit._id} >{fruit.title}</Option>)
            }
          </Select>
        )
      },
      {
        title: '规格',
        render: (d, r, index) => {
          return (
            <React.Fragment>
              <Input style={{width: 60}} placeholder="数量" value={this.state.fields[index].unitCount} onChange={(e) => this.editRowFieldAction(index, 'unitCount', e)} /> 斤 /
              <Select style={{width: 50, marginLeft: 5, marginRight: 10}} value={this.state.fields[index].unit} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.editRowFieldAction(index, 'unit', e)}>
                {
                  this.state.units.map(unit => <Option value={unit._id} key={unit._id} >{unit.title}</Option>)
                }
              </Select>
            </React.Fragment>
          )
        }
      },
      {
        title: '数量',
        render: (d, r, index) => {
          const unit = (() => {
            if(!this.state.fields[index].unit) return '';
            const unit = _.find(this.state.units, {_id: this.state.fields[index].unit});
            if(unit) {
              return unit.title
            }
            return '';
          })()
          return <Input value={this.state.fields[index].packCount} onChange={(e) => this.editRowFieldAction(index, 'packCount', e)} style={{width: 80}} suffix={unit} />
        }
      },
      {
        title: '总重量',
        render: (d, r, index) => <Input style={{width: 100}} value={this.state.fields[index].count} onChange={(e) => this.editRowFieldAction(index, 'count', e)} suffix='斤' />
      },
      {
        title: '单价',
        render: (d, r, index) => (
          <React.Fragment>
            <Input style={{width: 120}} value={this.state.fields[index].price}onChange={(e) => this.editRowFieldAction(index, 'price', e)} prefix="￥" suffix="元" />
             仓库均价: ￥{this.state.fields[index].avgPrice} 元/斤
          </React.Fragment>
        )
      },
      {
        title: '供应商',
        render: (d, r, index) => (
          <Select dropdownMatchSelectWidth={false} style={{width: 100}} value={this.state.fields[index].puller} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.editRowFieldAction(index, 'puller', e)}>
            {
              this.state.pullers.map(puller => <Option value={puller._id} key={puller._id} >{puller.title}</Option>)
            }
          </Select>
        )
      },
      {
        title: '是否付款',
        render: (d, r, index) => (
          <Radio.Group
            value={this.state.fields[index].payStatu}
            onChange={(e) => this.editRowFieldAction(index, 'payStatu', e.target.value)}
            options={[{label: '未付款', value: 1}, {label: '已付款', value: 2}]}
          />
        )
      },
      {
        title: '已付款数量',
        render: (d, r, index) => (
          <React.Fragment>
            <Input disabled={this.state.fields[index].payStatu === 2} value={this.state.fields[index].payStatu === 2 ? this.state.fields[index].price * this.state.fields[index].count : this.state.fields[index].payNumber} style={{width: 100}} onChange={(e) => this.editRowFieldAction(index, 'payNumber', e)} prefix="￥" suffix="元" /> (应付金额: ￥{this.state.fields[index].price * this.state.fields[index].count})
          </React.Fragment>
        )
      }
    ]
    return (
      <Modal
        title="入库信息"
        width="90%"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Table scroll={{x: true}} rowKey="key" dataSource={this.state.fields} size="middle" bordered pagination={false} columns={columns} />
      </Modal>
    )
  }
}

const dataTemplate = {
  fruit: '',
  count: 0,
  price: 0,
  payStatu: 1,
  puller: '',
  payNumber: 0,
  avgPrice: 0,
  unit: '',
  unitCount: '',
  packCount: '',
}
