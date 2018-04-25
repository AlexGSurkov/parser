'use strict';

/**
 * DayPicker API Docs: http://react-day-picker.js.org/docs/api-daypicker.html
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Constants from 'core/constants';
import StylizedWrapper from 'core/components/stylizedContainer/stylizedWrapper';
import DayPicker, {DateUtils} from 'react-day-picker';
import {injectIntl} from 'react-intl';

const localePrefix = 'core',
  {colorsScheme} = Constants,
  MILLISECONDS_IN_DAY = 1000 * 3600 * 24;

class Calendar extends Component {
  constructor() {
    super();

    this.state = {
      rangeModeOn: false,
      fromWasAlreadySelected: false,      // indicates whether previously selected day was already selected (used in range mode only)
      from: null                          // day from which range will be built (used in range mode only)
    };

    this.exposeDatesToParent = this.exposeDatesToParent.bind(this);
    this.keydownListener = this.keydownListener.bind(this);
    this.keyupListener = this.keyupListener.bind(this);
    this.filterDates = this.filterDates.bind(this);
    this.buildSelectedDays = this.buildSelectedDays.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleDayClickRange = this.handleDayClickRange.bind(this);
  }

  static get propTypes() {
    return {
      intl: PropTypes.object.isRequired,
      selectedDays: PropTypes.array,
      disabledDays: PropTypes.array,
      title: PropTypes.string,
      getCalendarState: PropTypes.func,    // function from which parent component can access calendar state, parent function recieves object with keys: disabledDays, selectedDays
      modifiers: PropTypes.object,         // when a modifier matches a specific day, its day cells receives a modifier CSS class, example DayPicker-Day--**key here**, more info: http://react-day-picker.js.org/docs/modifiers.html
      rawDayPickerProps: PropTypes.object  // object to use if needed to pass props directly into DayPicker component
    };
  }

  static get defaultProps() {
    return {
      selectedDays: [],
      disabledDays: [],
      title: 'Calendar',
      getCalendarState: () => true,
      modifiers: {},
      rawDayPickerProps: {}
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keydownListener);
    document.addEventListener('keyup', this.keyupListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownListener);
    document.removeEventListener('keyup', this.keyupListener);
  }

  exposeDatesToParent(newPartialState = {}) {
    const {selectedDays, disabledDays} = this.props,
      newParentDatesState = {selectedDays, disabledDays, ...newPartialState};

    this.props.getCalendarState(newParentDatesState);
  }

  keydownListener(e) {
    if (e.keyCode === 16) {
      this.setState({
        rangeModeOn: true
      });
    }
  }

  keyupListener(e) {
    if (e.keyCode === 16) {
      this.setState({
        rangeModeOn: false,
        from: null
      });
    }
  }

  filterDates(dates) {
    const filterDisabled = dates.filter(date => !this.props.disabledDays.some(disabled => DateUtils.isSameDay(disabled, date)));  // DateUtils.isSameDay compares equality by date month and year

    return _.uniqBy(filterDisabled, date => `${date.getMonth()}:${date.getDate()}:${date.getYear()}`); // remove duplications
  }

  /**
   * Builds array of dates including and in between specified dates
   *
   * @param    {Date}    from
   * @param    {Date}    to
   * @returns  {Date[]}  range of selected dates
   */
  buildSelectedDays(from, to) {
    if (_.isDate(from), _.isDate(to)) {
      const _from = DateUtils.clone(from).setHours(12,0,0,0),
            _to = DateUtils.clone(to).setHours(12,0,0,0),
            minDate = Math.min(_from, _to),
            maxDate = Math.max(_from, _to),
            dates = [];

      let timeDiff = maxDate - minDate;

      if (_from === _to) {
        return [from];
      }

      while (timeDiff >= 0) {
        dates.push(new Date(minDate + timeDiff));
        timeDiff = timeDiff - MILLISECONDS_IN_DAY;
      }

      return dates;
    }

    return [];
  }

  /**
   * Handles click when range mode is off
   *
   * @param  {Date}  day                 selected day
   * @param  {bool}  modifiers.selected  indicates whether the day was already selected
   * @param  {bool}  modifiers.disabled  indicates whether the day is disabled
   */
  handleDayClick(day, {selected, disabled}) {
    const selectedDays = this.props.selectedDays.slice();

    if (disabled) {
      return;
    }

    if (selected) {
      const selectedIndex = selectedDays.findIndex(selectedDay => DateUtils.isSameDay(selectedDay, day));

      selectedDays.splice(selectedIndex, 1);
    } else {
      selectedDays.push(day);
    }

    this.exposeDatesToParent({selectedDays});
  }

  /**
   * Handles click when range mode is on
   *
   * @param  {Date}  day                 selected day
   * @param  {bool}  modifiers.selected  indicates whether the day was already selected
   */
  handleDayClickRange(day, {selected}) {
    const selectedDays = this.props.selectedDays.slice(),
      from = _.isDate(this.state.from) ? DateUtils.clone(this.state.from) : this.state.from;

    if (from === null) {
      // set date from which range will be built
      this.setState({
        fromWasAlreadySelected: selected || false,
        from: day
      }, () => {
        this.exposeDatesToParent({
          selectedDays: this.filterDates(selectedDays.concat(day))
        });
      });
    } else if (this.state.fromWasAlreadySelected) {
      // extract range from selected dates
      const selectedInRange = this.buildSelectedDays(from, day);

      this.setState({
        from: null
      }, () => {
        this.exposeDatesToParent({
          selectedDays: selectedDays.filter(selectedDay => !selectedInRange.some(inRange => DateUtils.isSameDay(inRange, selectedDay)))
        });
      });
    } else {
      // add range to selected dates
      this.setState({
        from: null
      }, () => {
        this.exposeDatesToParent({
          selectedDays: this.filterDates([...selectedDays, ...this.buildSelectedDays(from, day)])
        });
      });
    }
  }

  render() {
    const hintMessage = this.props.intl.formatMessage({id: `${localePrefix}.calendar.hint`});
    const rangeModeMessage = `${
      this.props.intl.formatMessage({id: `${localePrefix}.calendar.rangeMode`})
    }: ${
      this.props.intl.formatMessage({id: `${localePrefix}.calendar.${this.state.rangeModeOn ? 'on' : 'off'}`})
    }`;

    return (
      <StylizedWrapper
        wrapperStyle={{display: 'inline-block', marginTop: 8}}
        headerStyle={{display: 'flex', alignItems: 'center'}}
        contentStyle={styles.wrapperContent}
        headerContent={this.props.title}
        leftTopBorder={true}
        rightTopBorder={true}
      >
        <DayPicker
          selectedDays={this.props.selectedDays}
          disabledDays={this.props.disabledDays}
          onDayClick={this.state.rangeModeOn ? this.handleDayClickRange : this.handleDayClick}
          months={new Array(12).fill(null).map((unused, idx) => this.props.intl.formatMessage({id: `${localePrefix}.calendar.months.${idx}`}))}
          weekdaysLong={new Array(7).fill(null).map((unused, idx) => this.props.intl.formatMessage({id: `${localePrefix}.calendar.weekdaysLong.${idx}`}))}
          weekdaysShort={new Array(7).fill(null).map((unused, idx) => this.props.intl.formatMessage({id: `${localePrefix}.calendar.weekdaysShort.${idx}`}))}
          modifiers={{
            even: {daysOfWeek: [2,4,6]},
            ...this.props.modifiers
          }}
          firstDayOfWeek={1}
          {...this.props.rawDayPickerProps}
        />
        <div style={styles.footer}>
          <div style={{
              backgroundColor: this.state.rangeModeOn ? colorsScheme.menuItem : colorsScheme.contentElementBackground,
              ...styles.rangeModeBlock
            }}
          >
            {this.state.showInfo
              ? hintMessage
              : rangeModeMessage
            }
          </div>
          <span
            onMouseEnter={() => this.setState({showInfo: true})}
            onMouseLeave={() => this.setState({showInfo: false})}
            style={styles.infoBlock}
          >{'i'}</span>
        </div>
      </StylizedWrapper>
    );
  }
}

const styles = {
  wrapperContent: {
    alignItems: 'center',
    border: `2px solid ${colorsScheme.contentElementBackground}`,
    borderRadius: '0 0 10px 10px',
    backgroundColor: colorsScheme.contentElementBackground
  },

  footer: {
    position: 'relative',
    width: '100%',
    height: 40,
    backgroundColor: colorsScheme.contentBackground,
    borderTop: `2px solid ${colorsScheme.contentElementBackground}`,
    borderRadius: '0 0 10px 10px'
  },

  rangeModeBlock: {
    paddingLeft: 17,
    height: '100%',
    lineHeight: '36px',
    fontFamily: 'GothamProLight',
    fontSize: '12px',
    textTransform: 'none',
    borderRadius: '0 0 9px 9px'
  },

  infoBlock: {
    display: 'inline-block',
    position: 'absolute',
    right: 13,
    top: 10,
    width: 18,
    height: 18,
    lineHeight: '16px',
    textAlign: 'center',
    fontFamily: 'GothamProLight',
    fontSize: '12px',
    textTransform: 'none',
    borderRadius: '50%',
    border: `1px solid ${colorsScheme.contentColor}`,
    color: colorsScheme.contentColor
  }
};

export default injectIntl(Calendar);
