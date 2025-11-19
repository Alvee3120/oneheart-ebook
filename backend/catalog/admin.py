from django.contrib import admin
from . models import Book,Tag, Category, Author
# Register your models here.
admin.site.register(Book)
admin.site.register(Tag)
admin.site.register(Author)
admin.site.register(Category)
