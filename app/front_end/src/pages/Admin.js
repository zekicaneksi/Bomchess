import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Admin.css';

const BanController = (props) => {
    const [banType, setBanType] = useState("playing");
    const [banLength, setBanLength] = useState("7");
    const [processMessage, setProcessMessage] = useState("");

    const controllerDivRef = useRef();

    function disableDiv(){
        controllerDivRef.current.classList.add("admin-disabled-div");
    }

    function enableDiv(){
        controllerDivRef.current.classList.remove("admin-disabled-div");
    }

    function handleBanBtn(){
        setProcessMessage('banning...');
        disableDiv();

        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                setProcessMessage('banned!');
                enableDiv();
              } else {
                setProcessMessage('error!');
                alert("unknown error from server");
              }
            }
          }
        HelperFunctions.ajax('/admin/ban','POST', responseFunction,{
            userID: props.userID,
            banType: banType,
            banLength: banLength
        });
    }

    function handleSelectChange(event, hook){
        disableDiv();
        hook(event.target.value);
    }

    useEffect(() => {
        enableDiv();
    },[banType,banLength]);

    return(
        <div ref={controllerDivRef}>
            <select name="banType" onChange={(event) => {handleSelectChange(event,setBanType)}} defaultValue={banType}>
                <option value="playing">Playing</option>
                <option value="chat">Chat</option>
                <option value="message">Message</option>
            </select>

            <select name="banLength" onChange={(event) => {handleSelectChange(event,setBanLength)}} defaultValue={banLength}>
                <option value="7">7 Days</option>
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
            </select>

            <button onClick={handleBanBtn}>Ban</button>

            <p style={{display:"inline"}}>{processMessage}</p>
        </div>
    )
}

const ResolveReport = (props) => {

    const handleBtnRef = useRef();

    function handleResolveBtn(){
        handleBtnRef.current.classList.add("admin-disabled-div");

        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                handleBtnRef.current.classList.add("admin-tick-bgimage");
              } else {
                alert("unknown error from server");
              }
            }
          }
        HelperFunctions.ajax('/admin/resolveReport','POST', responseFunction, {id:props.id});

    }

    return (
        <button ref={handleBtnRef} className="admin-resolve-btn" onClick={handleResolveBtn}></button>
    )
}

const TabReportedUsers = (props) => {

    const reports = props.info?.map((report,index) => {
        return(
            <div key={report.id} className='admin-user-div'>
                <p>ID: {report.id}</p>
                <p>Source Username: {report.sourceUsername}</p>
                <p>Target Username: {report.targetUsername}</p>
                <p>Reported Bio: {report.content}</p>
                <BanController userID={report.targetID}/>
                <ResolveReport id={report.id}/>
            </div>
        );
    });

    if(props.info === undefined){
        return (<p>Loading...</p>);
    } else {
        return(
            <React.Fragment>
                {reports}
            </React.Fragment>
        );
    }
}

const TabReportedMessages = (props) => {

    const reports = props.info?.map((report,index) => {
        console.log(report.content);
        return(
            <div key={report.id} className='admin-user-div'>
                <p>ID: {report.id}</p>
                <p>Source Username: {report.sourceUsername}</p>
                <p>Target Username: {report.targetUsername}</p>
                <p style={{whiteSpace: "pre-line"}}>Reported Messages: {report.content}</p>
                <BanController userID={report.targetID}/>
                <ResolveReport id={report.id}/>
            </div>
        );
    });

    if(props.info === undefined){
        return (<p>Loading...</p>);
    } else {
        return(
            <React.Fragment>
                {reports}
            </React.Fragment>
        );
    }
}

const TabReportedMatches = (props) => {

    const reports = props.info?.map((report,index) => {
        console.log(report.content);
        return(
            <div key={report.id} className='admin-user-div'>
                <p>ID: {report.id}</p>
                <p>Source Username: {report.sourceUsername}</p>
                <p>Target Username: {report.targetUsername}</p>
                <p>Reported Game ID: <a href={'/replay/'+report.content} target={"_blank"}>{report.content}</a></p>
                <BanController userID={report.targetID}/>
                <ResolveReport id={report.id}/>
            </div>
        );
    });

    if(props.info === undefined){
        return (<p>Loading...</p>);
    } else {
        return(
            <React.Fragment>
                {reports}
            </React.Fragment>
        );
    }
}

const TabAllUsers = (props) => {

    function banText(epoch){
        const banDate = new Date(epoch).getTime();
        const currentDate = new Date().getTime();
        if(banDate > currentDate){
            return HelperFunctions.epochToDate(epoch);
        } else {
            return "NA";
        }
    }

    const users = props.info?.map((user,index) => {
        return(
            <div key={user.id} className='admin-user-div'>
                <p>ID: {user.id}</p>
                <p>Username: {user.username}</p>
                <p>Email: {user.email}</p>
                <p>Bans: playing: {banText(user.bans.playing)} - message: {banText(user.bans.message)} - chat: {banText(user.bans.chat)}</p>
                <p>type: {user.type}</p>
                <BanController userID={user.id}/>
            </div>
        );
    });


    if(props.info === undefined){
        return (<p>Loading...</p>);
    } else {
        return(
            <React.Fragment>
                {users}
            </React.Fragment>
        );
    }
}

const Tabs = (props) => {

    return props.tabs.map( (tab,index) => {
        return(
            <div key={index}
            className='admin-tab-div'
            onClick={() => props.setSelectedTab(index)}>
                <p>{tab[0]}</p>
            </div>
        )
    });
}

const Admin = (props) => {

    const [selectedTab, setSelectedTab] = useState(0);

    const outletContext = useOutletContext();
    const userInfo = outletContext.userInfo;

    const [tabsInfo, setTabsInfo] = useState({});

    const tabs = [
    ['All Users', <TabAllUsers info={tabsInfo.AllUsers}/>],
    ['Reported Users', <TabReportedUsers info={tabsInfo.ReportedUsers}/>],
    ['Reported Messages', <TabReportedMessages info={tabsInfo.ReportedMessages}/>],
    ['Reported Matches', <TabReportedMatches info={tabsInfo.ReportedMatches}/>]
    ];

    function fetchInfo(){
        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                let responseJson = JSON.parse(httpRequest.responseText);
                setTabsInfo(responseJson);
              } else {
                alert("unknown error from server");
              }
            }
          }
        HelperFunctions.ajax('/admin/tabsInfo','GET', responseFunction);
    }

    function handleRefreshBtn(){
        fetchInfo();
    }

    useEffect(() => {
        // Component Did Mount
        fetchInfo();

        return () => {
            // Component Will Unmount

        };
    }, []);
    
    if(userInfo.type !== "admin"){
        return (<Navigate to='/' />);
    } else {
        return (
            <div className='admin-container'>
                <div className='admin-tab-container'>
                    <Tabs setSelectedTab={setSelectedTab} tabs={tabs}/>
                </div>
                <div className='admin-content-container'>
                    <button className='admin-refresh-btn' onClick={handleRefreshBtn}></button>
                    {tabs[selectedTab][1]}
                </div>
            </div>
        );
    }
}

export default Admin;