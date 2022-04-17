package main

import "math"

func main() {
	println("Initialised Go")
}

func getFactors(input int) []int {
	midPoint := int(math.Floor(float64(input / 2)))

	var results []int = []int{}

	i := 1
	for ; i <= midPoint; i++ {
		result := input / i
		if result%1 == 0 {
			results = append(results, i)
		}
	}

	return results
}
