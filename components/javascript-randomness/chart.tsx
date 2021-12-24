
import { memo, ReactElement } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import type { Data } from "pages/javascript-randomness";

const Chart = memo( function Chart ({ data }: { data: Data[]}): ReactElement {
	return (
		<div className="h-[300px]">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					width={ 200 } 
					height={ 300 } 
					data={ data } 
					margin={{ right: 50 }}
				>
					<Line 
						type="natural" 
						dataKey="math" 
						name="Math.Random()" 
						stroke="#0077bd" 
						dot={ false } 
						activeDot={ false } 
					/>
					<Line 
						type="natural" 
						dataKey="crypto" 
						name="crypto.getRandomValues()" 
						stroke="#e94d10" 
						dot={ false } 
						activeDot={ false } 
					/>
					<YAxis label={{ value: "% of total", angle: -90, position: "center", offset: 0 }} />
					<XAxis tick={ false } />
					<CartesianGrid />
					<Legend />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
});

export default Chart; 
