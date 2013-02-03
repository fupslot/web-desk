###Layout Tasks
- Write the function by passing a rectangle will fined a suitable place for it and returned:
**pageIndex** - a page the place is location on
**{top, left}** - coordinates
A function should belong to __PageCtrl__ object



###Layout Data Object

####General
	{
	  // the index page user stand on before leaved the app
      "pageSelected": "[page index]",
      // total amount of pages 
      "pageCount": "5",
      "pages": [],
      "groups": []
	}

####Page

    {
      "items": [
        {
          "id": "hash",
          "layout": {
            "rect": [0,0,0,0],
            "pageIdx": 0
          }
        }
      ]
    }
 