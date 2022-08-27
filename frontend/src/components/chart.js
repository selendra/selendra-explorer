import React from 'react';
import { Pie } from '@ant-design/plots';
const Chart = ({ dataEra, datacurrentEra }) => {
  const data = [
    {
      type: 'Ended',
      value: datacurrentEra,
    },
    {
      type: 'Active',
      value: dataEra,
    },
  ];

  const config = {
    appendPadding: 10,
    data,
    legend: false,
    // fill: "red",
    border: false,
    color: ['#ED1576', '#03A9F4'],
    // legend: { position: "top" },
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.5,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          color: 'white',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '20px',
        },
        content: 'Eras',
      },
    },
  };
  return <Pie style={{ width: '200px', height: '200px' }} {...config} />;
};

export default Chart;
