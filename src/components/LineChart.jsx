import React from 'react';
import ReactEcharts from 'echarts-for-react'
import _ from 'lodash';
import moment from 'moment';

export default class Chart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {dataSource} = this.props;
    console.log(dataSource, '12121')
    let groupDataByFruits = _.groupBy(dataSource, item => {
      return item.fruit._id;
    })
    console.log(groupDataByFruits, '12121')
    Object.keys(groupDataByFruits).map(key => {
      groupDataByFruits[key] = _.groupBy(groupDataByFruits[key], item => moment(item.createdAt).format('YYYY-MM-DD'))
    })
    console.log(groupDataByFruits, '12121')
    const options = {
      // xAxis:{
      //     type:'value',
      //     splitNumber:24
      // },
      legend: {
          orient: 'vertical',
          right: 10,
          data: this.props.dataSource.map(fruit => fruit.title),
          selected: (() => {
            let _s = {};
            this.props.dataSource.map(fruit => {
              _s[fruit.title] = fruit.total > 0
            });
            return _s;
          })(),
      },
      // series:[
      //   Object.keys(groupDataByFruits).map(key => ({
      //     name: key,
      //     type: 'line',
      //     data: Object.keys(groupDataByFruits[key]).map(key => ([key, 100]))
      //   }))
      // ]
      xAxis: {
        type:'time',
      },
      yAxis: {
          type: 'value',
          scale: false
      },
      series: [
          {
              name:'邮件营销',
              type:'line',
              data:[['2014-12-01', 600],['2015-01-02', 300],['2015-01-04', 100]]
          },
          {
              name:'邮件营2销',
              type:'line',
              data:[['2014-12-01', '100'],['2015-01-02', '200'],['2015-01-03', '400']]
          }
      ]
    }
    console.log(options, 'options')
    return (
      <ReactEcharts style={{height: 302}} option={options}/>
      // <div>12121</div>
    )
  }
}
