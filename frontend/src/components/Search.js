import { Button, Col, Input, Row, Select } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const searchBy = [
  'BLOCK NUMBER',
  'EXTRINSIC HASH',
  'ACCOUNT ADDRESS'
]

export default function Search() {
  const [selected, setSelected] = useState('BLOCK NUMBER');
  const [form, setForm] = useState('');

  return (
    <Row align="middle" gutter={[16, 16]}>
      <Col xs={18} sm={18} md={4} lg={4} xl={4}>
        <Select 
          className='search-select'
          defaultValue='BLOCK NUMBER'
          onChange={setSelected}
        >
          { searchBy.map((i,key) =>
            <Select.Option key={key} value={i}>{i}</Select.Option>  
          )}
        </Select>
      </Col>
      <Col xs={18} sm={18} md={16} lg={18} xl={16}>
        <Input
          placeholder="Search by block number, extrinsic hash or account address"
          className="home-search"
          value={form}
          onChange={e => setForm(e.target.value)}
        />
      </Col>
      <Col xs={6} sm={6} md={4} lg={4} xl={4}>
        <Link
          to={
            selected === 'BLOCK NUMBER' ?
            `/blocks/${form}` 
            :
            selected === 'EXTRINSIC HASH' ?
            `/extrinsics/${form}` 
            :
            `/accounts/${form}` 
          }
        >
          <Button className="home-search-btn">Search</Button>
        </Link>
      </Col>
    </Row>
  )
}