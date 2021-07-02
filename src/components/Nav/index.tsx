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

    const minDateLast = new Date(moment(props.glucoseData[0].result_dt_tm).format("MM-DD-YYYY"))
    const [maxDateLast, setMaxDateLast] = useState<Object>(new Date(moment(props.selectedDates.end).format("MM-DD-YYYY")))
    const [minDateTop, setMinDateTop] = useState<Object>(new Date(moment(props.selectedDates.start).format("MM-DD-YYYY")))
    const maxDateTop = new Date(moment(props.glucoseData[props.glucoseData.length - 1].result_dt_tm).format("MM-DD-YYYY"))
    const [lastDate, setLastDate] = useState<Object>(new Date(moment(props.selectedDates.start).format("MM-DD-YYYY")))
    const [topDate, setTopDate] = useState<Object>(new Date(moment(props.selectedDates.end).format("MM-DD-YYYY")))
    const [update, setUpdate] = useState<boolean>(false)

    useEffect(()=> {
        if (update === true) {
            setMaxDateLast(new Date(moment(props.selectedDates.end).format("MM-DD-YYYY")))
            setTopDate(new Date(moment(props.selectedDates.end).format("MM-DD-YYYY")))
            setUpdate(false)
        }
    }, [props.selectedDates.end])

    useEffect(()=> {
        if (update === true) {
            setMinDateTop(new Date(moment(props.selectedDates.start).format("MM-DD-YYYY")))
            setLastDate(new Date(moment(props.selectedDates.start).format("MM-DD-YYYY")))
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
                        onChangeRaw={(e: any)=> handleChangeRaw(e)}
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