<template>

	<div class="container">
		<div class="matrix-button">
			<button class="button1">Հարևանության մատրից</button>
		</div>
		<table class="table1">
			<tbody>
				<tr>
					<th></th>
					<th>Անի (001)</th>
					<th>Կարեն (002)</th>
					<th>Մարի (003)</th>
					<th>Դավիթ (004)</th>
					<th>Նարե (005)</th>
				</tr>
				<tr>
					<td>Անի (001)</td>
					<td>0.00</td>
					<td>21.61</td>
					<td>43.69</td>
					<td>18.87</td>
					<td class="td1">3.74</td>
					<!-- <td>Գերազանց</td>	 -->
				</tr>
				<tr>
					<td>Կարեն (002)</td>
					<td>21.61</td>
					<td>0.00</td>
					<td>17.00</td>
					<td class="td2">6.78</td>
					<td>24.09</td>
					<!-- <td>Լավ</td> -->
				</tr>
				<tr>
					<td>Մարի (003)</td>
					<td class="td3">43.69</td>
					<td>17.00</td>
					<td>0.00</td>
					<td>22.07</td>
					<td>46.05</td>
					<!-- <td>Թույլ</td> -->
				</tr>
				<tr>
					<td>Դավիթ (004)</td>
					<td>18.87</td>
					<td class="td2">6.78</td>
					<td>22.07</td>
					<td>0.00</td>
					<td>20.40</td>
					<!-- <td>Բավարար</td> -->
				</tr>
				<tr>
					<td>Նարե (005)</td>
					<td class="td1">3.74</td>
					<td>24.09</td>
					<td>46.05</td>
					<td>20.40</td>
					<td>0.00</td>
					<!-- <td>Գերազանց</td> -->
				</tr>
				<tr>
				</tr>
			</tbody>
		</table>
		<br /> <br>
		<hr>
		<h3>Տվյալների խմբավորում</h3>
		<table>
			<tbody>
				<tr>
					<th>Անուն Ազգանուն</th>
					<th>Նախորդ միջին գնահատական (100 միավորից)</th>
					<th>Մասնակցությունների տոկոս</th>
					<th>Նախորդ հարցումների միջին արդյունք</th>
					<th>Ընթացիկ հարցման արդյունք</th>
					<th>Տարբերություն (%)</th>
					<th>Առաջընթացի խմբավորում</th>
					<!-- <th>Առաջընթացի խմբավորում</th> -->
				</tr>
				<tr>
					<td>Անի Մանասյան</td>
					<td>85</td>
					<td>90%</td>
					<td>88</td>
					<td>92</td>
					<td>+4%</td>
					<td class="td1">Գերազանց</td>
				</tr>
				<tr>
					<td>Կարեն Սարգսյան</td>
					<td>73</td>
					<td>75%</td>
					<td>70</td>
					<td>75</td>
					<td>+5%</td>
					<td class="td2">Բավարար</td>
				</tr>
				<tr>
					<td>Մարի Դավթյան</td>
					<td>60</td>
					<td>50%</td>
					<td>58</td>
					<td>49</td>
					<td>-9%</td>
					<td class="td3">Թույլ</td>
				</tr>
				<tr>
					<td>Դավիթ Խաչատրյան</td>
					<td>67</td>
					<td>80%</td>
					<td>65</td>
					<td>68</td>
					<td>+3%</td>
					<td class="td2">Բավարար</td>
				</tr>
				<tr>
					<td>Նարե Մովսեսյան</td>
					<td>90</td>
					<td>95%</td>
					<td>91</td>
					<td>89</td>
					<td>-2%</td>
					<td class="td1">Գերազանց</td>
				</tr>
			</tbody>
		</table>
		<br />
		<hr />
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.matrix-button {
	width: 60%;
	margin-bottom: 20px;
}

.td3 {
	background-color: #f8d7da;
}

.td2 {
	background-color: #fff3cd;
}

.td1 {
	background-color: #d1e7dd;

}

.button1 {
	/* background-color: rgb(141, 168, 232); */
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	margin: 4px 2px;
	cursor: pointer;
}

.table1 {
	font-family: arial, sans-serif;
	border-collapse: collapse;
	width: 60%;
}

table {
	font-family: arial;
	border-collapse: collapse;
	width: 80%;
}

td,
th {
	border: 1px solid #dddddd;
	text-align: left;
	padding: 8px;
}
</style>