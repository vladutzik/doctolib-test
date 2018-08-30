## Steps of implementation 

##### 1. Fixed syntax erros in test.
##### 2. Analyzed failed test cases.

> While analyzing the faild test cases, I started to analyze the code implementation.
>  So i spotted some interesting facts:
>  1. The key used for the `Availability` Object, is the day of week, which will make imposible to query availability for more than 7 days (in current implementation). Because if we query the 8th day, then it will set the availability on the 1st day slot. 
>  2. The function that is itterationg through events and poopulates the `Availability` Object works in a wrong way. When an event of kind `appointment` is queryed then it filters already inserted `opening hours`, so if an `appointment` event is inserted before `opening` event (like in the test case 2) then it will try to filter an empty array of `opening hours`, and then will process the `opening` event, that will populate the availability with all `opening hours`.
>     ##### I've decided to redesign the entire implementation. 




 
