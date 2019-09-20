import React, { useState, useEffect } from "react";
import { Grid, LinearProgress } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import axios from "axios";

// components
import PageTitle from "../../components/PageTitle";

const columns = [
	{
		name: "Item Code",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Name",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Retail Price",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Quantity",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Wholesale Price",
		options: {
			filter: false,
			sort: true
		}
	}
];

const dataTableData = [];

export default function Items() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios
			.get("/items/")
			.then(res => {
				res.data.map(item => {
					var temp = [];

					temp[0] = item.item_code;
					temp[1] = item.name;
					temp[2] = item.retail_price;
					temp[3] = item.qty;
					temp[4] = item.wholesale_price;

					dataTableData.push(temp);
				});
				setIsLoading(false);
			})
			.catch(err => console.log(err));
	}, []);

	return (
		<>
			<PageTitle title="Items" />
			<Grid container spacing={4}>
				<Grid item xs={12}>
					{isLoading ? (
						<LinearProgress />
					) : (
						<MUIDataTable
							title="Items"
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
