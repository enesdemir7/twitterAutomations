//twitter follow code, limited to 30 people

var buttons = document.querySelectorAll('.css-175oi2r.r-sdzlij.r-1phboty.r-rs99b7.r-lrvibr.r-15ysp7h.r-4wgw6l.r-ymttw5.r-o7ynqc.r-6416eg.r-1ny4l3l');
var clickCount = 0;
buttons.forEach(function(button) {
    if (clickCount < 30) {
        button.click();
        clickCount++;
    }
});

//code to unfollow those who do not follow you on twitter
var LANGUAGE = "EN"; //NOTE: change it to use your language!
var WORDS =
{
	//English language:
	EN:
	{
		followsYouText: "Follows you", //Text that informs that follows you.
		followingButtonText: "Following", //Text of the "Following" button.
		confirmationButtonText: "Unfollow" //Text of the confirmation button. I am not totally sure.
	},
	//Spanish language:
	ES:
	{
		followsYouText: "Te sigue", //Text that informs that follows you.
		followingButtonText: "Siguiendo", //Text of the "Following" button.
		confirmationButtonText: "Dejar de seguir" //Text of the confirmation button. I am not totally sure.
	}
	//NOTE: if needed, add your language here...
}
var SKIP_USERS = //Users that we do not want to unfollow (even if they are not following you back):
[
	//Place the user names that you want to skip here (they will not be unfollowed):
	"user_name_to_skip_example_1",
	"user_name_to_skip_example_2",
	"user_name_to_skip_example_3"
];
SKIP_USERS.forEach(function(value, index) { SKIP_USERS[index] = value.toLowerCase(); }); //Transforms all the user names to lower case as it will be case insensitive.


//Function that unfollows non-followers on Twitter:
var usersFollowingMe = function(followsYouText, followingButtonText, confirmationButtonText)
{
	var nonFollowers = 0;
	followsYouText = followsYouText || WORDS.EN.followsYouText; //Text that informs that follows you.
	followingButtonText = followingButtonText || WORDS.EN.followingButtonText; //Text of the "Following" button.
	confirmationButtonText = confirmationButtonText || WORDS.EN.confirmationButtonText; //Text of the confirmation button.
	
	//Looks through all the containers of each user:
	var userContainers = document.querySelectorAll('[data-testid=UserCell]');
	Array.prototype.filter.call
	(
		userContainers,
		function(userContainer)
		{
			//Checks whether the user is following you:
			var followsYou = false;
			Array.from(userContainer.querySelectorAll("*")).find
			(
				function(element)
				{
					if (element.textContent === followsYouText) { followsYou = true; }
				}
			);

			//If the user is not following you:
			if (!followsYou)
			{
				//Finds the user name and checks whether we want to skip this user or not:
				var skipUser = false;
				Array.from(userContainer.querySelectorAll("[href^='/']")).find
				(
					function (element)
					{
						if (element.href.indexOf("search?q=") !== -1 || element.href.indexOf("/") === -1) { return; }
						var userName = element.href.substring(element.href.lastIndexOf("/") + 1).toLowerCase();
						Array.from(element.querySelectorAll("*")).find
						(
							function (subElement)
							{
								if (subElement.textContent.toLowerCase() === "@" + userName)
								{
									if (SKIP_USERS.indexOf(userName) !== -1)
									{
										console.log("We want to skip: " + userName);
										skipUser = true;
									}
								}
							}
						)
					}
				);
				
				//If we do not want to skip the user:
				if (!skipUser)
				{
					//Finds the unfollow button:
					Array.from(userContainer.querySelectorAll('[role=button]')).find
					(
						function(element)
						{
							//If the unfollow button is found, clicks it:
							if (element.textContent === followingButtonText)
							{
								element.click();
								nonFollowers++;
							}
						}
					);
				}
			}
		}
	);
	
	//If there is a confirmation dialog, press it automatically:
	Array.from(document.querySelectorAll('[role=button]')).find //Finds the confirmation button.
	(
		function(element)
		{
			//If the confirmation button is found, clicks it:
			if (element.textContent === confirmationButtonText)
			{
				element.click();
			}
		}
	);
	
	return nonFollowers; //Returns the number of non-followers.
}


//Scrolls and unfollows non-followers, constantly:
var scrollAndUnfollow = function()
{
	window.scrollTo(0, document.body.scrollHeight);
	usersFollowingMe(WORDS[LANGUAGE].followsYouText, WORDS[LANGUAGE].followingButtonText, WORDS[LANGUAGE].confirmationButtonText); //For English, you can try to call it without parameters.
	setTimeout(scrollAndUnfollow, 10);
};
scrollAndUnfollow();


//the code to unfollow all those you follow
(() => {
    const $followButtons = '[data-testid$="-unfollow"]';
    const $confirmButton = '[data-testid="confirmationSheetConfirm"]';
  
    const retry = {
      count: 0,
      limit: 3,
    };
  
    const scrollToTheBottom = () => window.scrollTo(0, document.body.scrollHeight);
    const retryLimitReached = () => retry.count === retry.limit;
    const addNewRetry = () => retry.count++;
  
    const sleep = ({ seconds }) =>
      new Promise((proceed) => {
        console.log(`WAITING FOR ${seconds} SECONDS...`);
        setTimeout(proceed, seconds * 1000);
      });
  
    const unfollowAll = async (followButtons) => {
      console.log(`UNFOLLOWING ${followButtons.length} USERS...`);
      await Promise.all(
        followButtons.map(async (followButton) => {
          followButton && followButton.click();
          await sleep({ seconds: 1 });
          const confirmButton = document.querySelector($confirmButton);
          confirmButton && confirmButton.click();
        })
      );
    };
  
    const nextBatch = async () => {
      scrollToTheBottom();
      await sleep({ seconds: 1 });
  
      const followButtons = Array.from(document.querySelectorAll($followButtons));
      const followButtonsWereFound = followButtons.length > 0;
  
      if (followButtonsWereFound) {
        await unfollowAll(followButtons);
        await sleep({ seconds: 2 });
        return nextBatch();
      } else {
        addNewRetry();
      }
  
      if (retryLimitReached()) {
        console.log(`NO ACCOUNTS FOUND, SO I THINK WE'RE DONE`);
        console.log(`RELOAD PAGE AND RE-RUN SCRIPT IF ANY WERE MISSED`);
      } else {
        await sleep({ seconds: 2 });
        return nextBatch();
      }
    };
  
    nextBatch();
  })();

//undo retweet
const timer = ms => new Promise(res => setTimeout(res, ms));

// Unretweet normally
const unretweetTweet = async (tweet) => {
      await tweet.querySelector('div[data-testid="unretweet"]').click();
      await timer(250);
      await document.querySelector('div[data-testid="unretweetConfirm"]').click();
      console.log('****// Unretweeted Successfully //****')
}

// Sometimes twitter shows your retweet but green retweet button is invisible and therefore you need to retweet again for make unreweet. This function is for that.
const unretweetUnretweetedTweet = async (tweet) => {
      await tweet.querySelector('div[data-testid="retweet"]').click();
      await timer(250);
      await document.querySelector('div[data-testid="retweetConfirm"]').click();
      console.log('****// Retweeted Successfully //****')
      await timer(250);
      unretweetTweet(tweet);
}

setInterval(async () =>
{
      // Get all tweets
      const retweetedTweetList = document.querySelectorAll('span[data-testid="socialContext"]');
      console.log('****// Retweeted Tweet List Collected //****')
      for (const retweet of retweetedTweetList) {
            const tweetWrapper = retweet.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
            tweetWrapper.scrollIntoView();
            
            const isRetweeted = tweetWrapper.querySelector('div[data-testid="unretweet"]');
            if (isRetweeted) {
                  console.log('****// Green Retweet Button Found - Starting "unretweetTweet" process //****')
                  await unretweetTweet(tweetWrapper);
            } else {
                  console.log('****// Green Retweet Button Not Found - Starting "unretweetUnretweetedTweet" process //****')
                  await unretweetUnretweetedTweet(tweetWrapper);
            }
            await timer(2000);
      }
      console.log('****// List Completed //****')
      console.log('****// Scrolling //****')
      console.log('                  ')
      console.log('                  ')
      console.log('                  ')
      console.log('                  ')
      console.log('                  ')
      console.log('                  ')
      console.log('                  ')
      console.log('                  ')
      await window.scrollTo(0, document.body.scrollHeight);
}, 6000);