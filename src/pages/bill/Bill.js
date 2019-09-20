import React, { useState, useEffect } from "react";
import { Grid, LinearProgress } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import axios from "axios";

// components
import PageTitle from "../../components/PageTitle";

const columns = [
	{
		name: "Bill Number",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Client Name",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Amount",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Cashier",
		options: {
			filter: false,
			sort: true
		}
	}
];

const dataTableData = [];

export default function Bill() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios
			.get("/bills/")
			.then(res => {
				res.data.map(item => {
					var temp = [];

					temp[0] = item.bill_number;
					temp[1] = item.client_name;
					temp[2] = item.amount;
					temp[3] = item.cashier;

					dataTableData.push(temp);
				});
				setIsLoading(false);
			})
			.catch(err => console.log(err));
	}, []);

	return (
		<>
			<PageTitle title="Bills" />
			<Grid container spacing={4}>
				<Grid item xs={12}>
					{isLoading ? (
						<LinearProgress />
					) : (
						<MUIDataTable
							title="Bills"
							data={dataTableData}
							columns={columns}
							options={{
								filterType: "checkbox"
							}}
						/>
					)}
				</Grid>
			</Grid>
		</>
	);
}
