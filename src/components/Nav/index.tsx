import { Dispatch, useState, useEffect } from 'react';
import './Nav.css';
import { Navbar, NavbarBrand, Form, FormGroup, Label } from 'reactstrap';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ISelectedDates, IData } from '../../GlobalTypes';

interface Props {
    selectedDates: ISelectedDates,
    setSelectedDates: Dispatch<ISelectedDates>,
    glucoseData: IData[]
}

function Navigation(props: Props): JSX.Element {

    const minDateLast = new Date(props.glucoseData[0].result_dt_tm)
    const [maxDateLast, setMaxDateLast] = useState<Object>(new Date(props.selectedDates.end))
    const [minDateTop, setMinDateTop] = useState<Object>(new Date(props.selectedDates.start))
    const maxDateTop = new Date(props.glucoseData[props.glucoseData.length - 1].result_dt_tm)
    const [lastDate, setLastDate] = useState<Object>(new Date(props.selectedDates.start))
    const [topDate, setTopDate] = useState<Object>(new Date(props.selectedDates.end))
    const [update, setUpdate] = useState<boolean>(false)

    useEffect(()=> {
        if (update === true) {
            setMaxDateLast(new Date(props.selectedDates.end))
            setTopDate(new Date(props.selectedDates.end))
            setUpdate(false)
        }
    }, [props.selectedDates.end])

    useEffect(()=> {
        if (update === true) {
            setMinDateTop(new Date(props.selectedDates.start))
            setLastDate(new Date(props.selectedDates.start))
            setUpdate(false)
        }
    }, [props.selectedDates.start])

    const handleChangeStart = (data: string): void => {
        setUpdate(true)
        props.setSelectedDates({...props.selectedDates, start: moment(data).format()})
    }

    const handleChangeEnd = (data: string): void => {
        setUpdate(true)
        props.setSelectedDates({...props.selectedDates, end: moment(data).format()})
    }

    // Disables typing/pasting into date input field
    const handleChangeRaw = (e: Event) => {
        e.preventDefault()
    }

    return (
      <div id="NavContainer">
        <Navbar id="Navbar" light>
          <NavbarBrand href="/" id="NavbarBrand">T4Med — Glucose Data</NavbarBrand>
            <Form id="NavForm">
                <FormGroup className="NavFormGroup">
                    <Label className="Label">Top:</Label>
                    <DatePicker
                        className="DatePicker"
                        selected={topDate}
                        value={lastDate}
                        onChange={(data: string)=>handleChangeEnd(data)}
                        onChangeRaw={(e: Event)=> handleChangeRaw(e)}
                        minDate={minDateTop}
                        maxDate={maxDateTop}
                    />
                </FormGroup>
                <FormGroup id="SecondNFG" className="NavFormGroup">
                    <Label className="Label">Last:</Label>
                    <DatePicker
                        className="DatePicker"
                        selected={lastDate}
                        value={lastDate}
                        onChange={(data: string)=>handleChangeStart(data)}
                        onChangeRaw={(e: Event)=> handleChangeRaw(e)}
                        minDate={minDateLast}
                        maxDate={maxDateLast}
                    />
                </FormGroup>
            </Form>
        </Navbar>
      </div>
    );
}

export default Navigation;