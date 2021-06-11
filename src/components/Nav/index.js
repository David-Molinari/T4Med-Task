import React from 'react';
import './Nav.css';
import { Navbar, NavbarBrand, Form, FormGroup, Label } from 'reactstrap';
import DatePicker from 'reactstrap-date-picker';
import moment from 'moment';

function Navigation(props) {

    const handleChangeStart = (data) => {
        props.setSelectedDates({...props.selectedDates, start: data})
    }

    const handleChangeEnd = (data) => {
        props.setSelectedDates({...props.selectedDates, end: data})
    }

    let minDateStart = moment(props.glucoseData[0].result_dt_tm).format()
    let maxDateStart = props.selectedDates.end
    let minDateEnd = props.selectedDates.start
    let maxDateEnd = moment(props.glucoseData[props.glucoseData.length - 1].result_dt_tm).format()
  
    return (
      <div id="NavContainer">
        <Navbar id="Navbar" light>
          <NavbarBrand href="/" id="NavbarBrand">T4Med — Glucose Data</NavbarBrand>
            <Form id="NavForm">
                <FormGroup className="NavFormGroup">
                    <Label className="Label">Top:</Label>
                    <DatePicker
                        className="DatePicker"
                        dateFormat="MM-DD-YYYY"
                        value={props.selectedDates.end}
                        onChange={(data)=>handleChangeEnd(data)}
                        minDate={minDateEnd}
                        maxDate={maxDateEnd}
                        showClearButton={false}
                    />
                </FormGroup>
                <FormGroup id="SecondNFG" className="NavFormGroup">
                    <Label className="Label">Last:</Label>
                    <DatePicker
                        className="DatePicker"
                        dateFormat="MM-DD-YYYY"
                        value={props.selectedDates.start}
                        onChange={(data)=>handleChangeStart(data)}
                        minDate={minDateStart}
                        maxDate={maxDateStart}
                        showClearButton={false}
                    />
                </FormGroup>
            </Form>
        </Navbar>
      </div>
    );
}

export default Navigation;