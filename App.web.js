import React, { Component, useEffect, useState } from 'react'

import CalendarHeader from './src_react/components/CalendarHeader';
import Sidebar from './src_react/components/Sidebar';
import Month from './src_react/components/Month';
// import axios from 'axios';
// import { parse } from '@babel/core';
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import gapi from 'react-gapi';
// import logo from './logo.svg';
//import ApiCalendar from 'react-google-calendar-api';
//import { Button, View } from 'react-native';

// const axios = require("axios");
// const cheerio = require("cheerio");
// const getHtml = async () => {
//   try {
//     return await axios.get("https://everytime.kr/timetable");
//   } catch (error) {
//     console.error(error);
//   }
// };
// console.log(getHtml)

// getHtml()
//   .then(html => {
//     let ulList = [];
//     const $ = cheerio.load(html.data);
//     const $bodyList = $("subject").children("td")
//     $bodyList.each(function(i, elem) {
//       ulList[i] = {
//           title: $(this).find('time').text(),
//           // image_url: $(this).find('name').attr('src'),
//           name: $(this).find('name'),
//           professor: $(this).find('professor'),
//           place: $(this).find('place'),
//       };
//     });

//     const data = ulList.filter(n => n.time);
//     console.log(data)
//     return data;
//   })
//   .then(res => {
// 	console.log(res)
//   });

var _title = ''
var _start = ''
var _end = ''
var _eventId = ''
var _tstart = ''
var _tend = ''
var _repeat = ''
var _repeat_option = ''
var _repeat_how = ''

function App() {
  // console.table(getMonth(3))
  const [loggedIn, setLoggedIn] = useState(false);

  var gapi = window.gapi
  var CLIENT_ID = "88262564393-247auf0fs74d92pggmbm5nfmprp6mesb.apps.googleusercontent.com"
  var API_KEY = "AIzaSyBuloUS31QvT13Wmz0HdmKA08Y4m3wTN5Y"
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
  // var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
  var SCOPES = "https://www.googleapis.com/auth/calendar.events"

  function changeCalendar(change_events) {
    console.log(change_events)
    var containerEl = $('#external-events-list')[0];
    calendar = new FullCalendar.Draggable(containerEl, {
    itemSelector: '.fc-event',
    eventData: function(eventEl) {
      return {
        title: eventEl.innerText.trim()
      }
    }
    });
    var calendarEl = $('#calendar1')[0];
    calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    locale: 'ko',
    editable: true,
    dayMaxEvents: 2,
    dayMaxEventRows: 2,
    contentHeight: 'auto',
    droppable: true,
    drop: function(arg) {
      arg.draggedEl.parentNode.removeChild(arg.draggedEl);
    },
    events: change_events,
    dateClick:function(event) {
      onDisplay()
      change('', '')
      change2('', event.dateStr)
      change3('', event.dateStr)
      change5('', '')
      change6('', '')
      repeat_change('', '')

      $('#change').val('')
      $('#change2').val(event.dateStr)
      $('#change3').val(event.dateStr)
      $('#change4').val(_tstart)
      $('#change5').val(_tend)
      
      document.getElementById('time_check_insert').checked = true
      document.getElementById('time_repeat').checked = true
    },
    eventClick:function(event) {
      console.log(event)
      var mainStart = event.event.startStr
      var mainEnd = event.event.endStr
      var cstart = ''
      var cend = ''
      var tstart = ''
      var tend = ''
      change('', event.event._def.title)
      change2('', mainStart)
      change3('', mainEnd)
      change4(event.event._def.publicId)
      change5('', '')
      change6('', '')
      repeat_change('', '')

      var yesterday = mainEnd
      if (mainStart !== mainEnd && mainEnd.length < 11)
        yesterday = makeYesterday(mainEnd)
      else{
        cstart = mainStart.substring(0, 10)
        cend = mainEnd.substring(0, 10)
        tstart = mainStart.substring(11, 16)
        tend = mainEnd.substring(11, 16)
        change2('', cstart)
        change3('', cend)
        change5('', tstart)
        change6('', tend)
        repeat_change('', '매주') //매일, 매주, 매월, 매년
      }

      const element = document.getElementById('eventsCenter')
      if (mainEnd === "")
        element.innerHTML = Display(event.event._def.title, mainStart, mainStart, '', '')
      else if (mainEnd.length < 11)
        element.innerHTML = Display(event.event._def.title, mainStart, yesterday, '', '')
      else
        element.innerHTML = Display(event.event._def.title, cstart, cend, tstart, tend)
      onDisplayM()

      //parseInt(), 0~3, 5~6, 8~9
      $('#change6').val(event.event._def.title)
      $('#change9').val('')
      $('#change10').val('')
      if (mainStart.length < 11) {
        $('#change7').val(mainStart)
      }
      else {
        $('#change7').val(cstart)
        $('#change9').val(tstart)
      }
      
      if (mainEnd === "")
        $('#change8').val(mainStart)
      else if (mainStart !== mainEnd && mainEnd.length < 11)
        $('#change8').val(yesterday)
      else {
        $('#change8').val(cend)
        $('#change10').val(tend)
      }

      if (tstart != '') {
        document.getElementById('time_check_update').checked = true
        $('#change9').show()
        $('#change10').show()
      } else {
        document.getElementById('time_check_update').checked = false
        $('#change9').hide()
        $('#change10').hide()
      }

      if (event.event._def.extendedProps.recurring != undefined) {
        document.getElementById('time_repeat2').checked = true
        $('#repeat2').show()
      } else {
        document.getElementById('time_repeat2').checked = false
        $('#repeat2').hide()
      }
    },
    });

    calendar.render();
  }

  const LoginOut = () => {
    gapi.auth.signOut(
      console.log('logout'),
      setLoggedIn(false),
    )
    changeCalendar([])
  }

  function change(e, title) {
    if ('' === e)
      _title = title
    else
      _title = e.target.value
  }
  function change2(e, start) {
    if ('' === e)
      _start = start
    else
      _start = e.target.value
  }
  function change3(e, end) {
    if ('' === e)
      _end = end
    else
      _end = e.target.value
  }
  function change4(eventId) {
    _eventId = eventId
  }
  function change5(e, tstart) {
    if ('' === e)
      _tstart = tstart
    else
      _tstart = e.target.value
  }
  function change6(e, tend) {
    if ('' === e)
      _tend = tend
    else
      _tend = e.target.value
  }
  function repeat_change(e, repeat) {
    if ('' === e)
      _repeat = repeat
    else
      _repeat = e.target.value
  }
  function repeat_change_how(e, repeat_how) {
    if ('' === e)
      _repeat_how = repeat_how
    else
      _repeat_how = e.target.value
  }

  function makeTomorrow(end) {
    const year = parseInt(end[0])*1000 + parseInt(end[1])*100 + parseInt(end[2])*10 + parseInt(end[3])
    const month = parseInt(end[5])*10 + parseInt(end[6])
    const day = parseInt(end[8])*10 + parseInt(end[9])
    // toISOString()
    var t = new Date(year, month-1, day+1)
    var tomorrow = ''
    if (t.getMonth()+1 < 10)
      tomorrow = t.getFullYear() + "-0" + (t.getMonth()+1)
    else
      tomorrow = t.getFullYear() + "-" + (t.getMonth()+1)
    if (t.getDate() < 10)
      tomorrow += "-0" + t.getDate()
    else
      tomorrow += "-" + t.getDate()
    return tomorrow
  }
  function makeYesterday(end) {
    const year = parseInt(end[0])*1000 + parseInt(end[1])*100 + parseInt(end[2])*10 + parseInt(end[3])
    const month = parseInt(end[5])*10 + parseInt(end[6])
    const day = parseInt(end[8])*10 + parseInt(end[9])
    var y = new Date(year, month-1, day-1)
    var yesterday = '';
    if (y.getMonth()+1 < 10)
      yesterday = y.getFullYear() + "-0" + (y.getMonth()+1)
    else
      yesterday = y.getFullYear() + "-" + (y.getMonth()+1)
    if (y.getDate() < 10)
      yesterday += "-0" + y.getDate()
    else
      yesterday += "-" + y.getDate()
    return yesterday
  }
  function makeRepeat() {

  }

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  function listUpcomingEvents() {
    var request = gapi.client.calendar.events.list({
      'calendarId': 'primary', /* Can be 'primary' or a given calendarid */
      // 'timeMin': (new Date(2022/1/28)).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      // 'maxResults': 100,
      'orderBy': 'startTime'
    });
    new_events = []
    request.execute(function(resp) {
      var events = resp.items;
      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
          var event = events[i]
          var start = event.start.dateTime
          var end = event.end.dateTime
          var id = event.id
          
          if (!start) {
            start = event.start.date
            end = event.end.date
          }
          new_events[i] = {
            title : event.summary,
            start : start,
            end : end,
            id : id,
            recurring: event.recurringEventId,
          }
        }
      }
      (function(){
        $(function(){
          changeCalendar(new_events)
        });
      })();
    });
  }

  /**
   * Load Google Calendar client library. List upcoming events
   * once client library is loaded.
   */
  function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
  }

  /**
   * Handle response from authorization server.
   *
   * @param {Object} authResult Authorization result.
   */
  function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
      // Hide auth UI, then load client library.
      authorizeDiv.style.display = 'none';
      loadCalendarApi();
    } else {
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
      authorizeDiv.style.display = 'inline';
    }
  }

  /**
   * Initiate auth flow in response to user clicking authorize button.
   *
   * @param {Event} event Button click event.
   */
  function handleAuthClick(event) {
    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult)
      .then(() => {
        setLoggedIn(true);
      })
    return false;
  }

  function InsertEventsF(title, start, end, tstart, tend) {
    if (start === end){
      if (tstart[0]+tstart[1] > tend[0]+tend[1]){
        alert('시간 설정이 잘못되었습니다.')
        return
      }
      else if (tstart[0]+tstart[1] === tend[0]+tend[1])
        if (tstart[3]+tstart[4] > tend[3]+tend[4]){
          alert('시간 설정이 잘못되었습니다.')
          return
        }
    }

    var event = null;
    if (tstart != '' && document.getElementById('time_check_update').checked === true) {
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    } else {
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    }
    // var request = gapi.client.calendar.events.insert({
    //     'calendarId': 'primary',
    //     'resource': event,
    // })
    // request.execute(function(event) {
    // })
    // loadCalendarApi()
    // $('#insertEvents').hide()
  }
  function updateEventsF(title, start, end, eventId, tstart, tend) {
    console.log("update")
    var test = document.getElementById('time_repeat2').checked
    if (test === true) {
      alert('이 일정 및 향후 일정, 모든 일정')
    }

    if (start === end){
      if (tstart[0]+tstart[1] > tend[0]+tend[1]){
        alert('시간 설정이 잘못되었습니다.')
        return
      }
      else if (tstart[0]+tstart[1] === tend[0]+tend[1])
        if (tstart[3]+tstart[4] > tend[3]+tend[4]){
          alert('시간 설정이 잘못되었습니다.')
          return
        }
    }

    var event = null;
    if (tstart != '' && document.getElementById('time_check_update').checked === true){
      start = start + 'T' + tstart + ':00+09:00'
      end = end + 'T' + tend + ':00+09:00'
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Dili'
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Dili'
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    } else {
      event = {
        'summary': title,
        'location': '',
        'description': '',
        'start': {
          'date': start,
        },
        'end': {
          'date': end,
        },
        // 'recurrence': [
        //   'RRULE:FREQ=DAILY;COUNT=1'
        // ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      }
    }

    // var request = gapi.client.calendar.events.update({
    //   'calendarId': 'primary',
    //   'eventId': eventId,
    //   'resource': event
    // });
    // request.execute(function(event) {
    // })
    // loadCalendarApi()
    // $('#updateEvents').hide()
    // offRepeat()
  }
  function deleteEventsF(eventId) {
    console.log(eventId)
    var request = gapi.client.calendar.events.delete({
      'calendarId': 'primary',
      'eventId': eventId,
    });
    request.execute(function(event) {
    })
    loadCalendarApi()
    $('#updateEvents').hide()
    offRepeat()
  }

  function onDisplay() {
    $('#insertEvents').show()
  }
  function offDisplay() {
    $('#insertEvents').hide()
  }

  function onDisplayM() {
    $('#mainEvents').show()
  }
  function offDisplayM() {
    $('#mainEvents').hide()
  }

  function onDisplayU() {
    $('#mainEvents').hide()
    $('#updateEvents').show()
  }
  function offDisplayU() {
    $('#updateEvents').hide()
  }
  function offRepeat() {
    $('#updateEvents_repeat').hide()
    $('#deleteEvents_repeat').hide()
  }

  function insertDisplay() {
    if ( _tstart == '')
      InsertEventsF(_title, _start, makeTomorrow(_end), _tstart, _tend)
    else 
      InsertEventsF(_title, _start, _end, _tstart, _tend)
  }
  function updateDisplay() {
    if ( _tstart == '')
      updateEventsF(_title, _start, makeTomorrow(_end), _eventId, _tstart, _tend)
    else 
      updateEventsF(_title, _start, _end, _eventId, _tstart, _tend)
  }
  function deleteDisplay() {
    _repeat_how = $("input[name=repeat2]:checked").val()
    if (_repeat_how === "모든 일정") {
      _eventId = _eventId.split('_')[0]
    } else if (_repeat_how === "이 일정" && _eventId.split('_')[1] != undefined) {
      _eventId = _eventId.split('_')[0]+"_"+_eventId.split('_')[1]
    } else { //나중에 수정하세요
      _eventId = _eventId.split('_')[0]
    }
    deleteEventsF(_eventId)
  }

  function repeat() {
    var test = document.getElementById('time_repeat2').checked
    if (test === true) {
      _repeat_option = $("select[id=repeat2] option:selected").text()
      console.log(_repeat_option)
    } else {
      offRepeat()
      updateDisplay()
    }
  }
  function repeat2() {
    var test = document.getElementById('time_repeat2').checked
    if (test === true) {
      $("#deleteEvents_repeat").show()
      _repeat_option = $("select[id=repeat2] option:selected").text()
      console.log(_repeat_option)
    } else {
      offRepeat()
      deleteDisplay()
    }
  }

  function Display(title, start, end, tstart, tend) {
    if (tstart == '')
      return '<p>' + title + '</p><p>' + start + '</p><p>' + end + '</p>'
    else
      return '<p>' + title + '</p><p>' + start + " " + tstart + '</p><p>' + end + " " + tend + '</p>'
  }

  function time_check() {
    var test = document.getElementById('time_check_update').checked
    if (test === false) {
      $('#change9').hide()
      $('#change10').hide()
    } else {
      $('#change9').show()
      $('#change10').show()
    }
  }
  function time_check_insert() {
    var test = document.getElementById('time_check_insert').checked
    if (test === false) {
      $('#change4').hide()
      $('#change5').hide()
    } else {
      $('#change4').show()
      $('#change5').show()
    }
  }

  function time_repeat() {
    var test = document.getElementById('time_repeat').checked
    if (test === false) 
      $('#repeat').hide()
    else 
      $('#repeat').show()
  }
  function time_repeat2() {
    var test = document.getElementById('time_repeat2').checked
    if (test === false) 
      $('#repeat2').hide()
    else 
      $('#repeat2').show()
  }

  function list() {}

  const insertStyle = {
    padding: 10,
    display: 'none',
    position: 'absolute',
    width: 400,
    height: 500,
    backgroundColor: 'ivory',
    zIndex: 998,
  }
  const insertStyle_repeat = {
    padding: 10,
    display: 'none',
    position: 'absolute',
    width: 400,
    height: 500,
    backgroundColor: 'ivory',
    zIndex: 999,
  }

  //body - div - div - 2번div - table - tbody - tr - td

  // function a(){
  // document.getElementById('login').click()
  // }
  if (loggedIn) {
    return (
      <div className='App'>
        <header className='App-header'>
          <div id='insertEvents' style={insertStyle}>
            <button onClick={offDisplay}>x</button>
            <button onClick={insertDisplay}>o</button>
            <p><input id="change" name="text" placeholder='(제목 및 시간 추가)' onChange={change} /></p>
            <p><input type="date" id="change2" name="text" onChange={change2} /><input type="time" id="change4" name="text" onChange={change5} /></p>
            <p><input type="date" id="change3" name="text" onChange={change3} /><input type="time" id="change5" name="text" onChange={change6} /></p>
            <p><input id="time_check_insert" type="checkbox" onChange={time_check_insert} /></p>
            <p>
              <input id="time_repeat" type="checkbox" onChange={time_repeat} />
              <select id="repeat" onChange={repeat_change}>
                <option value="매일">매일</option>
                <option value="매주">매주</option>
                <option value="매월">매월</option>
                <option value="매년">매년</option>
                <option value="주중_매일(월-금)">주중 매일(월-금)</option>
                <option value="맞춤">맞춤</option>
              </select>
            </p>
          </div>

          <div id='mainEvents' style={insertStyle}>
            <button onClick={offDisplayM}>x</button>
            <button onClick={onDisplayU}>update</button>
            <div id='eventsCenter'></div>
          </div>

          <div id="updateEvents_repeat" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={updateDisplay}>o</button>
            <p><input type="radio" name="repeat" />이 일정</p>
            <p><input type="radio" name="repeat" />이 일정 및 향후 일정</p>
            <p><input type="radio" name="repeat" />모든 일정</p>
          </div>
          <div id="deleteEvents_repeat" style={insertStyle_repeat}>
            <button onClick={offRepeat}>x</button>
            <button onClick={deleteDisplay}>o</button>
            <p><input type="radio" name="repeat2" value="이 일정" checked="checked" />이 일정</p>
            <p><input type="radio" name="repeat2" value="이 일정 및 향후 일정" />이 일정 및 향후 일정</p>
            <p><input type="radio" name="repeat2" value="모든 일정" />모든 일정</p>
          </div>

          <div id='updateEvents' style={insertStyle}>
            <button onClick={offDisplayU}>x</button>
            <button onClick={repeat}>o</button>
            <button onClick={repeat2}>delete</button>
            <p><input id="change6" name="text" onChange={change} /></p>
            <p><input type="date" id="change7" name="text" onChange={change2} /><input type="time" id="change9" name="text" onChange={change5} /></p>
            <p><input type="date" id="change8" name="text" onChange={change3} /><input type="time" id="change10" name="text" onChange={change6} /></p>
            <p><input id="time_check_update" type="checkbox" onChange={time_check} /></p>
            <p>
              <input id="time_repeat2" type="checkbox" onChange={time_repeat2} />
              <select id="repeat2" onChange={repeat_change}>
                <option value="매일">매일</option>
                <option value="매주">매주</option>
                <option value="매월">매월</option>
                <option value="매년">매년</option>
                <option value="주중_매일(월-금)">주중 매일(월-금)</option>
                <option value="맞춤">맞춤</option>
              </select>
            </p>
          </div>
          {/* <div id='updateEvents_repeat' style={insertStyle}>
            <button onClick={offDisplayU}>x</button>
            <button onClick={deleteDisplay}>o</button>
            <p><input id="change6" name="text" onChange={change} /></p>
            <p><input type="date" id="change7" name="text" onChange={change2} /><input type="time" id="change9" name="text" onChange={change5} /></p>
            <p><input type="date" id="change8" name="text" onChange={change3} /><input type="time" id="change10" name="text" onChange={change6} /></p>
            <p><input id="time_check_update" type="checkbox" onChange={time_check} /></p>
            <p>
              <input id="time_repeat2" type="checkbox" onChange={time_repeat2} />
              <select id="repeat2" onChange={repeat_change}>
                <option value="이일정">매일</option>
                <option value="모든일정">매주</option>
              </select>
            </p>
          </div> */}

          <button onClick={list}>시간표</button>
          <div id='wrap'>
            <div id='external-events'>
              <div id='external-events-list'></div>
            </div>
            <div id='calendar-wrap'>
              <div id='calendar1'></div>
            </div>
          </div>
          <button onClick={LoginOut}>logout</button>
        </header>
      </div>
    );
  }
  return (
    <div className='App'>
      <div id="authorize-div">
        {handleAuthClick(event)}
      </div>
    </div>
  );
}

export default App;

// import React from 'react'
// import {View, Text} from 'react-native';

// function App() {
//   return (
//     <View>
//       <Text>Hello world from react</Text>
//     </View>
//   )
// }

// export default App