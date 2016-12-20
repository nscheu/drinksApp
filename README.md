The OpenShift `nodejs` cartridge documentation can be found at:

http://openshift.github.io/documentation/oo_cartridge_guide.html#nodejs

Data and View Definitions:

Recipe:
-------------------
- Units (Oz, Qt, Cup, etc)
- Component/Ingredient (OJ, Absinthe, Whisky)

A Unit is a defined structure in the database - May use existing Units API for this if one is found to be useful.

Unit {
	name: "Ounce",
	shorthand: "Oz",
	conversionParent: "Quart",
	conversionParentFactor: 32,
	public: true, // Public will be default for unit,
	creator: 110398883 // UserID
}


A Component is a user defined ingredient such as orange juice or whisky. Components may be set to public visibility.

Component {
	name: "OJ",
	public: true, // Public: false will be default for component,
	creator: 110398883 // UserID
}

My Profile
-------------------
- Account Info
- My Public Profile
- My Recipes
- My Bar

Account Info
-------------------
- First Name
- Middle Name
- Last Name
- Password

My Public Profile
-------------------

My Recipes
-------------------
- Recipe List
	- Add
		- Search for public duplicate/Modification/Variation
	- Edit
	- Delete
	- Set Public/Private

My Bar
-------------------
- Component/Ingredient List
	- Add
		- Search for public duplicate/Modification/Variation
	- Edit
	- Delete

-------------------
-------------------
-------------------
-------------------
-------------------

Use Cases

1. User creates an account - Creation View redirects to My Profile View
2. User logs into existing account - to My Profile View

3. User views account information - Account Info View
4. User adds account information - Account Info View
5. User edits account information - Account Info View
6. User deletes account information (partial) - Account Info View
7. User deletes account information (total - irreversible) - Account Info View
8. User changes password - Account Info View - Modal Change Password View

9. User adds new recipe - My Profile View - Recipe List - Modal Add Recipe View
10. User edits recipe - My Profile View - Recipe List  - Modal Edit Recipe View
11. User deletes recipe - My Profile View - Recipe List  - Confirmation Dialog
12. User Publishes Recipe - My Profile View - Recipe List

13. User adds new ingredient - My Profile View - My Bar - Modal Add ingredient View
14. User edits ingredient - My Profile View - My Bar - Modal Edit ingredient View
15. User deletes recipe - My Profile View - My Bar - Confirmation Dialog

16. User generates recipe list from Bar Contents - My Bar


-------------------
