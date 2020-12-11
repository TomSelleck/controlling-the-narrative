import {
	HttpClient
} from '@angular/common/http';
import {
	Component,
	OnInit
} from '@angular/core';
import * as moment from 'moment';

import {
	ChartErrorEvent,
	ChartMouseLeaveEvent,
	ChartMouseOverEvent,
	ChartSelectionChangedEvent,
	ChartType,
} from 'angular-google-charts';
import {
	combineLatest
} from 'rxjs';

@Component({
	selector: 'app-google-column-chart',
	templateUrl: './google-column-chart.component.html',
	styleUrls: ['./google-column-chart.component.css']
})
export class GoogleColumnChartComponent implements OnInit {

	chosenGranularity = 'Monthly';
	chosenData = 'Dow Jones';

	granularityOptions: string[] = ['Daily', 'Weekly', 'Monthly'];
	dataOptions: string[] = ['Dow Jones', 'Covid Cases'];

	trumpDailyLikes = [];
	dowJonesDaily = [];
	covidDaily = [];

	columns = [];
	data;

	drawData = [];

	title = "time";
	width = 800;
	height = 600;
	type = 'LineChart';

  options = {
    width: this.width,
    height: this.height,
    animation: {
      duration: 500,
      easing: 'ease-in-out',
      startup: true
    },
    // explorer: { // Not pretty
    //   axis: 'horizontal',
    //   keepInBounds: true,
    //   maxZoomIn: 4.0
    // },
    series: {
      // Gives each series an axis name that matches the Y-axis below.
      0: {
        targetAxisIndex: 0
      },
      1: {
        targetAxisIndex: 1
      }
    }
  }

	constructor(private http: HttpClient) {

		// Make the HTTP request:
		let trumpRequest = this.http.get('assets/trump_daily_likes.json');
		let dowJonesReqest = this.http.get('assets/dow_jones_daily.json');
		let covidRequest = this.http.get('assets/daily_covid_cases.json');

		const combined = combineLatest([trumpRequest, dowJonesReqest, covidRequest]);

		combined.subscribe(([trumpLikesResult, dowJonesResult, covidResult]) => {

			// Trump Data Loaded
			for (var value of trumpLikesResult as any) {
				this.trumpDailyLikes.push({
					date: new Date(value.date),
					value: value.favorites
				});
			}

			// Dow Jones Data Loaded
			for (var value of dowJonesResult as any) {
				this.dowJonesDaily.push({
					date: new Date(value.Date),
					value: parseInt(value["Adj Close"])
				});
			}

			// Dow Jones Data Loaded
			for (var value of covidResult as any) {
				this.covidDaily.push({
					date: new Date(value.date),
					value: parseInt(value["cases"])
				});
			}

			this.drawGraph();
		});
	}

	drawGraph() {
		this.title = 'Controlling the Narrative',
			this.type = ChartType.LineChart;

		if (this.chosenData == "Dow Jones") {
			this.columns = ["Date", "Likes", "DowJones"];
		} else if (this.chosenData == "Covid Cases") {
			this.columns = ["Date", "Likes", "Covid Cases"];
		}

		this.drawData = [];

		// Aggregate Data by month
		if (this.chosenGranularity == "Monthly") {
			this.drawMonthlyChart();
		}
	}

	drawMonthlyChart() {
		let trump_monthly_totals = {};
		let dow_monthly_totals = {};
		let covid_monthly_totals = {};

		// Aggregate Likes
		trump_monthly_totals = this.getTrumpMonthlyLikes();

		// Get end of month prices
		dow_monthly_totals = this.getDowEndOfMonthPrice();

		// Aggregate Covid Cases
		covid_monthly_totals = this.getMonthlyCovidCases();

    let dates = [];
    let axisTitle;
		// Start timeline from 2020
		if (this.chosenData == "Covid Cases") {
      dates = this.getDates("2020-01-01", "2020-11-01");
      axisTitle = "Covid Cases";
		} else {
      dates = this.getDates("2017-01-01", "2020-11-01");
      axisTitle = "Dow Jones";
		}

		// Get Dates between start and end for data
		for (let dateStr of dates) {

			let trumpLikes = trump_monthly_totals[dateStr];
			let dowPrice = dow_monthly_totals[dateStr];
			let covidCases = covid_monthly_totals[dateStr];

			// Dow Jones Price
			if (this.chosenData == "Covid Cases") {
				this.drawData.push([new Date(dateStr), trumpLikes, covidCases]);
			} else if (this.chosenData == "Dow Jones") {
				this.drawData.push([new Date(dateStr), trumpLikes, dowPrice]);
			}
    }
    
    // Set Axes Values
    this.options["vAxes"] = {
      // Adds titles to each axis.
      0: {
        title: 'Twitter Likes',
        gridlines: {
          color: 'transparent'
        },
        baselineColor: 'transparent'
      },
      1: {
        title: axisTitle,
        gridlines: {
          color: 'transparent'
        },
        //baselineColor: 'transparent'
      }
    }

    


    console.log("Print Axis");
    console.log(this.options["vAxes"]);

	}

	getMonthlyCovidCases() {
		let monthlyCovidCases = {};

		for (var day of this.covidDaily) {
			let month = day.date.getMonth() + 1;
			if (month < 10) {
				month = `0${month}`;
			}

			let year = day.date.getFullYear();

			if (monthlyCovidCases[`${year}-${month}-01`]) {
				monthlyCovidCases[`${year}-${month}-01`] += day.value;
			} else {
				monthlyCovidCases[`${year}-${month}-01`] = day.value;
			}
		}

		return monthlyCovidCases;
	}

	getDowEndOfMonthPrice() {
		let previousDateYear = "2017";
		let previousDateMonth = "01";
		let previousPrice = 0;

		let dow_monthly_totals = {}

		for (var day of this.dowJonesDaily) {
			let month = day.date.getMonth() + 1;
			if (month < 10) {
				month = `0${month}`;
			}
			let year = day.date.getFullYear();
			let price = day.value;


			if (previousDateMonth != month) {
				dow_monthly_totals[`${previousDateYear}-${previousDateMonth}-01`] = previousPrice;
			}

			previousPrice = price;
			previousDateMonth = month;
			previousDateYear = year;
		}

		// Get the last date, should be Nov 2020
		dow_monthly_totals[`${previousDateYear}-${previousDateMonth}-01`] = previousPrice;

		return dow_monthly_totals;
	}

	getTrumpMonthlyLikes() {
		let trump_monthly_totals = {};

		for (var day of this.trumpDailyLikes) {
			let month = day.date.getMonth() + 1;
			if (month < 10) {
				month = `0${month}`;
			}

			let year = day.date.getFullYear();

			if (trump_monthly_totals[`${year}-${month}-01`]) {
				trump_monthly_totals[`${year}-${month}-01`] += day.value;
			} else {
				trump_monthly_totals[`${year}-${month}-01`] = day.value;
			}
		}

		return trump_monthly_totals;
	}

	getDates(start, stop) {
		var dateArray = [];
		var currentDate = moment(start);
		var stopDate = moment(stop);
		while (currentDate <= stopDate) {
			dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
			currentDate = moment(currentDate).add(1, 'months');
		}
		return dateArray;
	}

	// User has chosen a new time granularity
	granularityChange(event) {
		this.chosenGranularity = event.value;

		this.drawGraph();
	}

	// User has chosen a new time granularity
	dataChange(event) {
		this.chosenData = event.value;

		this.drawGraph();
	}

	ngOnInit() {

	}

	public onReady() {
		console.log('Chart ready');
	}

	public onError(error: ChartErrorEvent) {
		console.error('Error: ' + error.message.toString());
	}

	public onSelect(event: ChartSelectionChangedEvent) {
		console.log('Selected: ' + event.toString());
	}

	public onMouseEnter(event: ChartMouseOverEvent) {
		console.log('Hovering ' + event.toString());
	}

	public onMouseLeave(event: ChartMouseLeaveEvent) {
		console.log('No longer hovering ' + event.toString());
	}

}