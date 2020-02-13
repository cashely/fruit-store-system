import $ from '../ajax'
import {message} from 'antd';
import Bignumber from 'bignumber';
export const getUser = () => {
  return new Promise((resolve, reject) => {
    resolve(JSON.parse(sessionStorage.getItem('user')))
  });
}

export const setUser = user => {
  return new Promise((resolve, reject) => {
    resolve(sessionStorage.setItem('user', JSON.stringify(user)))
  })
}


export function userInfoAction() {
  getUser().then(user => {
    this.setState({
      user
    })
  })
}


export function deleteAction({
  success = () => {},
  failed = () => {},
  url
}) {
  return $.delete(url).then(res => {
    if(res.code === 0) {
      success()
      message.success('操作成功')
    } else {
      message.error('操作失败');
    }
  })
}



export function multipliedBy(a, b) {
  return Number(new Bignumber(a).multipliedBy(b).toFixed(2));
}
export function plus(a, b) {
  return Number(new Bignumber(a).plus(b).toFixed(2));
}
export function minus(a, b) {
  return Number(new Bignumber(a).minus(b).toFixed(2));
}

export function dividedBy(a, b) {
  return Number(new Bignumber(a).dividedBy(b).toFixed(2));
}
