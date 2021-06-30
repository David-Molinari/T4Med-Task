import { Dispatch } from 'react';
import './Nav.css';
import { Navbar, NavbarBrand, Form, FormGroup, Label } from 'reactstrap';
import moment from 'moment';
import DatePicker from 'reactstrap-date-picker';
import { ISelectedDates, IData } from '../../GlobalTypes';

interface Props {
    selectedDates: ISelectedDates,
    setSelectedDates: Dispatch<ISelectedDates>,
    glucoseData: IData[]
}

function Navigation(props: Props): JSX.Element {

    const handleChangeStart = (data: string): void => {
        props.setSelectedDates({...props.selectedDates, start: data})
    }

    const handleChangeEnd = (data: string): void => {
        props.setSelectedDates({...props.selectedDates, end: data})
    }

    let minDateStart: string = moment(props.glucoseData[0].result_dt_tm).format()
    let maxDateStart: string = props.selectedDates.end
    let minDateEnd: string = props.selectedDates.start
    let maxDateEnd: string = moment(props.glucoseData[props.glucoseData.length - 1].result_dt_tm).format()
  
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
                        onChange={(data: string)=>handleChangeEnd(data)}
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
                        onChange={(data: string)=>handleChangeStart(data)}
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