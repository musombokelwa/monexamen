from database.db import get_all_promotions, create_promotion as db_create_promotion

class PromotionModel:
    @staticmethod
    def create_promotion(name):
        return db_create_promotion(name)

    @staticmethod
    def get_all_promotions():
        return get_all_promotions()
