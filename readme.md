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

## Development

This is a legacy Chrome extension that uses Grunt, Bower, and RequireJS.

Install dependencies:

```bash
npm install --ignore-scripts --no-audit --no-fund
npm run setup
```

Validate source files:

```bash
npm run validate
```

Build the RequireJS bundle:

```bash
npm run build
```

Run the full validation/build check:

```bash
npm test
```
