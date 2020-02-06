import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, InputNumber, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
import InnerSelectModal from './InnerSelectModal';
export default class OuterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        fruit: props.fruit ? props.fruit : '',
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
      },
      visible: {
        inner: false
      },
      maxCount: 0,
      units: [],
      innerDetail: {
        price: 0,
        store: 0
      },
      pushers: [],
      fruits: [],
      payStatus: [{
        id: 1,
        title: '未付款'
      }, {
        id: 2,
        title: '已付款'
      }]
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

  openInnerModalAction() {
    if(!this.state.fields.fruit) {
      return message.error('请先选择种类');
    }
    this.openModelAction('inner');
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
    }, () => {
      if(fieldname === 'fruit') {
        const fruit = _.find(this.state.fruits, {_id: this.state.fields.fruit});
        this.setState({
          fields: Object.assign({}, this.state.fields, {avgPrice: fruit.avgPrice})
        })
      }
      if(fieldname === 'unit' || fieldname === 'packCount' || fieldname === 'unitCount') {
        if(this.state.fields.unit && this.state.fields.packCount && this.state.fields.unitCount) {
          this.setState({
            fields: Object.assign({}, this.state.fields, {count: this.state.fields.packCount * this.state.fields.unitCount})
          })
        }
      }
    })
  }

  okInnerSelectModalAction(selected) {
    this.changeAction('order', selected[0])
    this.innerDetailAction(selected[0])
    this.cancelModelAction('inner');
  }

  innerDetailAction(id) {
    $.get(`/inner/${id}`).then(res => {
      if(res.code === 0 && typeof res.data === 'object') {
        this.setState({
          innerDetail: res.data
        });
      }
    })
  }

  okAction() {
    const valid = this.validAction();
    if(!valid) {
      return;
    }
    if(this.props.id) {
      $.put(`/outer/${this.props.id}`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }else {
      $.post(`/outer`, this.state.fields).then(res => {
        if(res.code === 0) {
          message.success('操作成功');
          this.props.onOk();
        } else {
          message.error('操作失败');
        }
      })
    }
  }

  validAction() {
    if(this.state.innerDetail.store < this.state.fields.count) {
      message.error('超出库存限制!')
      return false;
    }
    if(!this.state.fields.fruit) {
      message.error('种类必须选择');
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

  componentWillMount() {
    this.pushersListAction();
    this.fruitsListAction();
    this.unitsListAction();
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
    return (
      <Modal
        title="出库信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        {
          this.state.visible.inner && <InnerSelectModal id={this.state.fields.fruit} visible={this.state.visible.inner} onOk={this.okInnerSelectModalAction.bind(this)} onCancel={this.cancelModelAction.bind(this, 'inner')}/>
        }
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="水果名称">
            <Select disabled={isEdit} value={this.state.fields.fruit} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => {this.changeAction('fruit', e); this.fruitCountAction(e)}}>
              {
                this.state.fruits.map(fruit => <Option value={fruit._id} key={fruit._id} >{fruit.title}</Option>)
              }
            </Select>
          </Item>
          <Item label="入库单">
            <Input allowClear value={this.state.fields.order} onChange={(e) => this.changeAction('order', e)} style={{width: 300}} />
            <Button style={{marginLeft: 10}} type="primary" onClick={this.openInnerModalAction.bind(this)}>选择</Button>
          </Item>
          <Item label="规格">
            <Input style={{width: 60}} placeholder="数量" value={this.state.fields.unitCount} onChange={(e) => this.changeAction('unitCount', e)} /> 斤 /
            <Select style={{width: 50, marginLeft: 5, marginRight: 10}} value={this.state.fields.unit} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.changeAction('unit', e)}>
              {
                this.state.units.map(unit => <Option value={unit._id} key={unit._id} >{unit.title}</Option>)
              }
            </Select>
             数量: <Input value={this.state.fields.packCount} onChange={(e) => this.changeAction('packCount', e)} style={{width: 80}} suffix={unit} />
          </Item>
          <Item label="出库总数量">
            <Input disabled={isEdit} value={this.state.fields.count} max={fruit.length && fruit[0].total} onChange={(e) => {this.changeAction('count', e)}} style={{width: 250}} suffix="斤" />
            <span className="ant-form-text">(余量: {this.state.innerDetail.store})</span>
          </Item>
          <Item label="单价">
            <Input prefix="￥" suffix="元" style={{width: 250}} value={this.state.fields.price} onChange={(e) => this.changeAction('price', e)} />
            <span className="ant-form-text">(入库价: {this.state.innerDetail.price})</span>
        </Item>
          <Item label="出货方">
            <Select value={this.state.fields.pusher} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.changeAction('pusher', e)}>
              {
                this.state.pushers.map(pusher => <Option value={pusher._id} key={pusher._id} >{pusher.title}</Option>)
              }
            </Select>
          </Item>
          <Item label="是否付款">
            <Radio.Group
              value={this.state.fields.payStatu}
              onChange={(e) => this.changeAction('payStatu', e.target.value)}
              options={[{label: '未付款', value: 1}, {label: '已付款', value: 2}]}
            />
          </Item>
          <Item label="已付款数量">
            <Input disabled={this.state.fields.payStatu === 2} value={this.state.fields.payStatu === 2 ? this.state.fields.price * this.state.fields.count : this.state.fields.payNumber} style={{width: 250}} onChange={(e) => this.changeAction('payNumber', e)} prefix="￥" suffix="元" /> (应付金额: ￥{this.state.fields.price * this.state.fields.count})
          </Item>
        </Form>
      </Modal>
    )
  }
}
