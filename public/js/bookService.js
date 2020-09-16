export const bookService = {
    books:[],

    async load() {
        let books = await fetch("./js/book.json").then(file => file.json());
        this.set(books);
    },

    get () {
        return this.books;
    },

    set (book) {
        this.books = book;
    },

    update (book) {
        this.books = [...this.books, ...book];
    }

}