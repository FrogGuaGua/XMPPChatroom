import pymysql




class databaseControl():
    def __init__(self) -> None:
        self.database = pymysql.Connect('localhost','root','123456','rind')
    def getDatabase(self):
        return self.database
    def query(self,sql):
        return self.database.query(sql)
    def sqlFilter():
        pass
