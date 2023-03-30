import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import Dashboard from './components/Dashboard/Dashboard';
import Landing from './components/Landing/Landing'

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = { currentPage: "landingScreen" };
        this.setStateOfParent = this.setStateOfParent.bind(this);
        this.checkToken = this.checkToken.bind(this);
      }

      componentDidMount() {
        this.checkToken();
      }
      
      checkToken() {
        const token = localStorage.getItem("token");
        if (token) {
          this.setState({ currentPage: "dashboardScreen" });
        }else{
          this.setState({ currentPage: "landingScreen" });
        }
      }

    
      setStateOfParent(page) {
        this.setState({ currentPage: page });
      }
    
      pageComponents = {
        landingScreen: Landing,
        dashboardScreen: Dashboard,
      };
    
      render() {
        const CurrentPage = this.pageComponents[this.state.currentPage];
        return <CurrentPage setStateOfParent={this.setStateOfParent} />;
      }

}


class App extends React.Component {
    render(){return(<Main/>);}
  }
  
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);