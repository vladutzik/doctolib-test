## Steps of implementation 

##### 1. Fixed syntax erros in test.
##### 2. Analyzed failed test cases.

> While analyzing the faild test cases, I started to analyze the code implementation.
>  So i spotted some interesting facts:
>  1. The key used for the `Availability` Object, is the day of week, which will make imposible to query availability for more than 7 days (in current implementation). Because if we query the 8th day, then it will set the availability on the 1st day slot. 
>  2. The function that is itterationg through events and poopulates the `Availability` Object works in a wrong way. When an event of kind `appointment` is queryed then it filters already inserted `opening hours`, so if an `appointment` event is inserted before `opening` event (like in the test case 2) then it will try to filter an empty array of `opening hours`, and then will process the `opening` event, that will populate the availability with all `opening hours`.
>     ##### I've decided to redesign the entire implementation. 

##### 3. Refactoring of implementation function.

> First of all I decided that I need to create an Object that will include all the dates with events, including reccuring events for the entire required period. The key will be the entire date string of format `D-MM-YYYY` this will allow us to fetch availability for years ahead. `weekly_reccuring` means that event is repeating each 7 days. Each day is an Object will contain multiple keys that represents the kind of event, in our case there are only 2 kinds `opening` and `appointment`.
> Now after we already have `daysWithEvents` Object, we can set the `availability` for the requested time frame. I am setting availbaility by subtracting all `appointment` hours from `opening` hours for each day that has events.
> ###### Now all initial tests are green, that's just awesome!


 
