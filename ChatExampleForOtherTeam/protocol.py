class protocol():
    @staticmethod
    def login():
        return {"tag":"login","username":""}
    def success():
        return {"tag":"success"}
    @staticmethod
    def message():
        return {"tag":"message","from":"","to":"","type":"","info":""}
    @staticmethod
    def userInfo():
        return {"nickname":"","jid":"","ip":"","status":"online"}
    @staticmethod
    def presence():
        return {"tag":"presence","presence":""}
    
