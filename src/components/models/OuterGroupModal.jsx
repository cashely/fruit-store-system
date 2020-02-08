import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, Table, message, InputNumber, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
import InnerSelectModal from './InnerSelectModal';
export default class OuterGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      visible: {
        inner: false
      },
      maxCount: 0,
      units: [],
      innerDetail: [],
      pushers: [],
      fruits: [],
      payStatus: [{
        id: 1,
        title: '未付款'
      }, {
        id: 2,
        title: '已付款'
      }],
      dataSource: [],
      editRow: 0
    }
  }

  openModelAction(modelName, id = null) {
    const visible = _.cloneDeep(this.state.visible);
    visible[modelName] = true;
    this.setState({
      visible,
      id
    })
  }

  openInnerModalAction(index) {
    if(!this.state.fields[index].fruit) {
      return message.error('请先选择种类');
    }
    this.setState({
      editRow: index
    }, () => {
      this.openModelAction('inner');
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

  changeAction(fieldname, e) {
    if(!e) return;
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    })
  }

  okInnerSelectModalAction(selected) {
    this.editRowFieldAction(this.state.editRow, 'order', selected[0])
    this.innerDetailAction(selected[0])
    this.cancelModelAction('inner');
  }

  innerDetailAction(id) {
    $.get(`/inner/${id}`).then(res => {
      if(res.code === 0 && typeof res.data === 'object') {
        const innerDetail = _.cloneDeep(this.state.innerDetail);
        innerDetail[this.state.editRow] = res.data;
        this.setState({
          innerDetail
        })
      }
    })
  }

  okAction() {
    const valid = this.validAction();
    if(!valid) {
      return;
    }

    const faileds = [];
    const promises = this.state.fields.map((field, index) => {
      return $.post(`/outer`, field).then(res => {
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

  validAction() {
    // if(this.state.innerDetail.store < this.state.fields.count) {
    //   message.error('超出库存限制!')
    //   return false;
    // }
    // if(!this.state.fields.fruit) {
    //   message.error('种类必须选择');
    //   return false;
    // }
    let valid = this.state.fields.map((field, index) => {
      return field.count <= this.state.innerDetail[index].store
    })
    valid = valid.every(v => v);
    if(!valid) {
      message.error('超出库存限制');
      return false;
    }
    return true;
  }

  detailAction() {
    $.get(`/outer/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }

  pushersListAction() {
    $.get('/pushers').then(res => {
      if(res.code === 0) {
        this.setState({
          pushers: res.data
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

  fruitCountAction(e) {
    $.get(`/count/${e}`).then(res => {
      if(res.code === 0 && res.data && res.data.total) {
        this.setState({
          maxCount: res.data.total
        })
      }
    })
  }

  addRowAction() {
    const fields = _.cloneDeep(this.state.fields);
    const innerDetail = _.cloneDeep(this.state.innerDetail);
    fields.push(_.assign(_.cloneDeep(dataTemplate), {key: this.state.fields.length}));
    innerDetail.push(_.assign(_.cloneDeep(detailTemplate), {key: this.state.fields.length}))
    this.setState({
      fields,
      innerDetail
    })
  }

  delRowAction(index) {
    let fields = _.cloneDeep(this.state.fields);
    let innerDetail = _.cloneDeep(this.state.innerDetail);
    fields = fields.slice(0, index).concat(fields.slice(index + 1));
    innerDetail = innerDetail.slice(0, index).concat(innerDetail.slice(index + 1));
    this.setState({
      fields,
      innerDetail
    })
  }

  editRowFieldAction(index, fieldname, e) {
    const fields = _.cloneDeep(this.state.fields);
    fields[index][fieldname] = typeof(e) === 'object' ? e.currentTarget.value : e;
    if(fieldname === 'fruit') {
      const fruit = _.find(this.state.fruits, {_id: typeof(e) === 'object' ? e.currentTarget.value : e});
      fields[index].avgPrice = fruit.avgPrice
    }

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
    this.pushersListAction();
    this.fruitsListAction();
    this.unitsListAction();
    this.addRowAction();
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;
    const isEdit = !!this.props.id;
    const fruit = this.state.fruits.filter(v => v._id === this.state.fields.fruit);
    const unit = (() => {
      if(!this.state.fields.unit) return '';
      const unit = _.find(this.state.units, {_id: this.state.fields.unit});
      if(unit) {
        return unit.title
      }
      return '';
    })()

    const columns = [
      {
        title: '',
        key: 'a',
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
        key: 'b',
        render: (d, r, index) => (
          <Select dropdownMatchSelectWidth={false} style={{width: 180}} value={this.state.fields[index].fruit} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.editRowFieldAction(index, 'fruit', e)}>
            {
              this.state.fruits.map(fruit => <Option value={fruit._id} key={fruit._id} >{fruit.title}</Option>)
            }
          </Select>
        )
      },
      {
        title: '入库单',
        key: 'c',
        render: (d, r, index) => (
          <React.Fragment>
            <Input allowClear value={this.state.fields[index].order} onChange={(e) => this.editRowFieldAction(index, 'order', e)} style={{width: 260}} />
            <Button style={{marginLeft: 10}} type="primary" onClick={this.openInnerModalAction.bind(this, index)}>选择</Button>
          </React.Fragment>
        )
      },
      {
        title: '规格',
        key: 'd',
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
        key: 'e',
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
        title: '出库总数量',
        key: 'f',
        render: (d, r, index) => {
          return (
            <React.Fragment>
              <Input disabled={isEdit} value={this.state.fields[index].count} max={fruit.length && fruit[0].total} onChange={(e) => {this.editRowFieldAction(index, 'count', e)}} style={{width: 100}} suffix="斤" />
              <span className="ant-form-text">(余量: {this.state.innerDetail[index].store})</span>
            </React.Fragment>
          )
        }
      },
      {
        title: '规格单价',
        key: 'g',
        render: (d, r, index) => (
          <React.Fragment>
            <Input style={{width: 120}} value={this.state.fields[index].price} onChange={(e) => this.editRowFieldAction(index, 'price', e)} prefix="￥" suffix="元" />
            <span className="ant-form-text">(入库价: {this.state.innerDetail[index].price} 元/斤)</span>
          </React.Fragment>
        )
      },
      {
        title: '出货方',
        key: 'h',
        render: (d, r, index) => (
          <Select dropdownMatchSelectWidth={false} value={this.state.fields[index].pusher} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.editRowFieldAction(index, 'pusher', e)} style={{width: 180}}>
            {
              this.state.pushers.map(pusher => <Option value={pusher._id} key={pusher._id} >{pusher.title}</Option>)
            }
          </Select>
        )
      },
      {
        title: '是否付款',
        key: 'i',
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
        key: 'j',
        render: (d, r, index) => (
          <React.Fragment>
            <Input disabled={this.state.fields[index].payStatu === 2} value={this.state.fields[index].payStatu === 2 ? this.state.fields[index].price * this.state.fields[index].packCount : this.state.fields[index].payNumber} style={{width: 100}} onChange={(e) => this.editRowFieldAction(index, 'payNumber', e)} prefix="￥" suffix="元" /> (应付金额: ￥{(this.state.fields[index].price * this.state.fields[index].packCount).toFixed(2)})
          </React.Fragment>
        )
      }
    ]

    return (
      <Modal
        title="出库信息"
        width="90%"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        {
          this.state.visible.inner && <InnerSelectModal id={this.state.fields[this.state.editRow].fruit} visible={this.state.visible.inner} onOk={this.okInnerSelectModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'inner')}/>
        }
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
  pusher: '',
  payNumber: 0,
  avgPrice: 0,
  unit: '',
  unitCount: '',
  packCount: '',
  order: ''
}
const detailTemplate = {
  price: 0,
  store: 0
}
